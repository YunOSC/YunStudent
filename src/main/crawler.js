const http = require('axios')
const webdriver = require('selenium-webdriver')
require('chromedriver')

class Crawler {
  constructor (ssoValidateServer, sessionId) {
    this.ssoValidateServer = ssoValidateServer
    this.sessionId = sessionId
    this.initDriver()
  }

  initDriver () {
    this.driver = new webdriver.Builder()
      .withCapabilities({
        chromeOptions: {
          args: ['--headless', '--disable-dev-shm-usage', '--disable-plugins']
        }
      })
      .forBrowser('chrome')
      .build()

    this.By = webdriver.By
    this.until = webdriver.until
    this.until.elementsIsPresent = (locator) => {
      return new webdriver.Condition('for no element to be located ' + locator, (driver) => {
        return this.driver.findElements(locator).then((elements) => {
          return elements.length >= 0
        })
      })
    }

    this.until.elementIsNotPresent = (locator) => {
      return new webdriver.Condition('for no element to be located ' + locator, (driver) => {
        return this.driver.findElements(locator).then((elements) => {
          return elements.length === 0
        })
      })
    }
  }

  ssoIndex () {
    return this.driver.get('https://webapp.yuntech.edu.tw/workstudy/Home/Index').then(() => {
      return this.driver.getSession()
    }).then((session) => {
      this.sessionId = session
      return this.driver
    }).then(() => {
      var loadMask = this.By.xpath('//div[@id="loading-mask"]')
      return this.driver.wait(this.until.elementsIsPresent(loadMask), 1000).then(() => {
        console.log('Is Present')
        return this.driver.wait(this.until.elementIsNotPresent(loadMask), 3000)
      }).then(() => {
        return this.driver
      })
    })
  }

  ssoSource () {
    return this.driver.getPageSource().then((src) => {
      src = src.replace(/\/YunTechSSO\//g, 'https://webapp.yuntech.edu.tw/YunTechSSO/')
      src = src.replace(/src="..\/Content\/Images\//g, 'src="https://webapp.yuntech.edu.tw/YuntechSSO/Content/Images/')
      src = src.replace(/href="\/Ext4\//g, 'src="https://webapp.yuntech.edu.tw/Ext4/')
      src = src.replace(/\/\/ssl/g, 'https://ssl')
      return src
    })
  }

  ssoLogin (account, password) {
    return this.driver.get('https://webapp.yuntech.edu.tw/YunTechSSO/Account/Login').then(() => {
      let validationCode = this.By.xpath('//img[@id="ValidationImage"]')
      return this.driver.wait(this.until.elementsIsPresent(validationCode), 2000).then(() => {
        return this.driver.findElement(validationCode).takeScreenshot()
      })
    }).then((base64Img) => {
      return http({
        url: this.ssoValidateServer + '/validationCode/base64',
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: {image: base64Img}
      }).then((response) => {
        return response.data
      })
    }).then((data) => {
      if (data.success !== undefined) {
        return this.driver.findElement(this.By.xpath('//*[@id="pLoginName-inputEl"]')).then((element) => {
          element.clear()
          return element.sendKeys(account).then(() => {
            return this.driver.findElement(this.By.xpath('//*[@id="pLoginPassword-inputEl"]'))
          })
        }).then((element) => {
          element.clear()
          return element.sendKeys(password).then(() => {
            return this.driver.findElement(this.By.xpath('//*[@id="pSecretString-inputEl"]'))
          })
        }).then((element) => {
          element.clear()
          return element.sendKeys(data.code).then(() => {
            return this.driver.findElement(this.By.xpath('//*[@id="LoginButton-btnInnerEl"]'))
          })
        }).then((element) => {
          element.click()
          return this.driver.sleep(1000)
        }).then(() => {
          return this.driver.getCurrentUrl().then((url) => {
            return url === 'https://webapp.yuntech.edu.tw/YunTechSSO/Home/Index'
          })
        })
      } else if (data.fail !== undefined) {
        return false
      }
    }).then((result) => {
      if (!result) {
        return this.driver.findElement(this.By.xpath('//*[@id="button-1005-btnInnerEl"]')).then((element) => {
          element.click()
          return false
        })
      } else {
        return true
      }
    })
  }

  close () {
    this.driver.close()
  }

  quit () {
    this.driver.quit()
  }
}

export default Crawler
