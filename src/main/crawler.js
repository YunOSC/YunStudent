const http = require('axios')
const webdriver = require('selenium-webdriver')
require('chromedriver')

const browserArgs = ['--start-maximized', '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-plugins']
const globalError = [
  'WebDriverError', 'NoSuchWindowError', 'TypeError'
]
const highLayerError = [
  'NoSuchElementError'
]

class Crawler {
  constructor (ssoValidateServer, cookies) {
    this.By = webdriver.By
    this.until = webdriver.until
    this.creating = false
    this.created = false

    this.ssoValidateServer = ssoValidateServer
    this.cookies = cookies
    this.retryMaximum = 3
  }

  initDriver (account, password) {
    return new Promise((resolve) => {
      this.creating = true
      this.account = account
      this.password = password

      this.driver = new webdriver.Builder()
        .withCapabilities({
          chromeOptions: {
            args: browserArgs
          }
        })
        .forBrowser('chrome')
        .build()

      this.until.elementsIsPresent = (locator) => {
        return new webdriver.Condition('for no element to be located ' + locator, () => {
          return this.findElements(locator).then((elements) => {
            return elements.length >= 0
          })
        })
      }

      this.until.elementIsNotPresent = (locator) => {
        return new webdriver.Condition('for no element to be located ' + locator, () => {
          return this.findElements(locator).then((elements) => {
            return elements.length === 0
          })
        })
      }
      this.creating = false
      this.created = !this.creating
      return resolve()
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

  ssoLogin (redirect, retryCounter) {
    retryCounter = retryCounter || 0
    console.log('login: ' + retryCounter)
    return new Promise((resolve, reject) => {
      return this.getCurrentUrl((url) => {
        if (redirect === undefined || redirect == null) {
          return this.get('https://webapp.yuntech.edu.tw/YunTechSSO/Account/Login')
        }
      }).then(() => {
        // Fetch validation code from backend.
        let validationCode = this.By.xpath('//img[@id="ValidationImage"]')
        return this.driver.wait(this.until.elementsIsPresent(validationCode), 5000).then(() => {
          return this.findElement(validationCode).then((element) => {
            return element.takeScreenshot()
          })
        }).then((base64Img) => {
          return http({
            url: this.ssoValidateServer + '/validationCode/base64',
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: {image: base64Img}
          }).then((response) => {
            return response.data.success !== undefined ? response.data : response.data
          })
        })
      }).then((codeData) => {
        // Fill in form datas
        return this.findElement(this.By.xpath('//*[@id="pLoginName-inputEl"]')).then((element) => {
          // Account
          element.clear()
          return element.sendKeys(this.account).then(() => {
            return this.findElement(this.By.xpath('//*[@id="pLoginPassword-inputEl"]'))
          })
        }).then((element) => {
          // Password
          element.clear()
          return element.sendKeys(this.password).then(() => {
            return this.findElement(this.By.xpath('//*[@id="pSecretString-inputEl"]'))
          })
        }).then((element) => {
          // Validation Code
          element.clear()
          return element.sendKeys(codeData.code).then(() => {
            return this.findElement(this.By.xpath('//*[@id="LoginButton-btnInnerEl"]'))
          })
        })
      }).then((loginBtn) => {
        loginBtn.click()
        return this.driver.sleep(1000).then(() => {
          let failBtn = this.By.xpath('//*[@id="button-1005-btnInnerEl"]')
          return this.driver.findElement(failBtn).then((element) => {
            element.click()
            return this.ssoLogin(redirect, retryCounter + 1)
          }).catch(() => {
            return resolve(true)
          })
        })
      }).catch((err) => {
        if (highLayerError.includes(err.name) && retryCounter < this.retryMaximum) {
          return this.driver.sleep(1000).then(() => {
            return this.ssoLogin(redirect, retryCounter + 1)
          })
        }
        return reject(err)
      })
    })
  }

  visit (url, retryCounter) {
    retryCounter = retryCounter || 0
    console.log('visit: ' + retryCounter)
    return new Promise((resolve, reject) => {
      return this.get(url).then(() => {
        return this.getCurrentUrl().then((currentUrl) => {
          return url === currentUrl
        })
      }).then((result) => {
        if (result) {
          return true
        } else {
          return this.ssoLogin(url)
        }
      }).then((loginResult) => {
        if (loginResult) {
          return this.driver.wait(this.until.urlIs(url), 5000).then(() => {
            return resolve(true)
          }).catch(() => {
            return resolve(false)
          })
        } else {
          return resolve(false)
        }
      }).catch((err) => {
        if (globalError.includes(err.name) && retryCounter < this.retryMaximum) {
          return this.initDriver(this.account, this.password).then(() => {
            return this.driver.sleep(1000)
          }).then(() => {
            return this.visit(url, retryCounter + 1)
          })
        }
        return reject(err)
      })
    })
  }

  get (url, retryCounter) {
    retryCounter = retryCounter || 0
    /*
    if (this.driver === undefined || this.driver == null) {
      return this.initDriver(this.account, this.password).then(() => {
        return this.get(url)
      })
    } else {
    */
    return this.driver.get(url).catch((err) => {
      if (globalError.includes(err.name) && retryCounter < this.retryMaximum) {
        return this.initDriver(this.account, this.password).then(() => {
          return this.get(url, retryCounter + 1)
        })
      }
      throw err
    })
    // }
  }

  getCurrentUrl (retryCounter) {
    retryCounter = retryCounter || 0
    return this.driver.getCurrentUrl().catch((err) => {
      if (globalError.includes(err.name) && retryCounter < this.retryMaximum) {
        return this.initDriver(this.account, this.password).then(() => {
          return this.getCurrentUrl(retryCounter + 1)
        })
      }
      throw err
    })
  }

  findElement (locator, retryCounter) {
    retryCounter = retryCounter || 0
    return this.driver.findElement(locator).catch((err) => {
      if (globalError.includes(err.name) && retryCounter < this.retryMaximum) {
        return this.initDriver(this.account, this.password).then(() => {
          return this.findElement(locator, retryCounter + 1)
        })
      }
      throw err
    })
  }

  findElements (locator, retryCounter) {
    retryCounter = retryCounter || 0
    return this.driver.findElements(locator).catch((err) => {
      if (globalError.includes(err.name) && retryCounter < this.retryMaximum) {
        return this.initDriver(this.account, this.password).then(() => {
          return this.findElements(locator, retryCounter + 1)
        })
      }
      throw err
    })
  }

  close () {
    this.driver.close()
  }

  quit () {
    this.driver.quit()
  }
}

Crawler.browserArgs = browserArgs

export default Crawler
