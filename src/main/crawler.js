const webdriver = require('selenium-webdriver')
require('chromedriver')

class Crawler {
  constructor (sessionId, account, password) {
    this.sessionId = sessionId
    this.account = account
    this.password = password
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

  close () {
    this.driver.close()
  }

  quit () {
    this.driver.quit()
  }
}

export default Crawler
