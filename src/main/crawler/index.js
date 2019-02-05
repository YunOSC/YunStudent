const webdriver = require('selenium-webdriver')
require('chromedriver')

const loginJS = require('./login')
const workStudyJS = require('./work_study')
const utilsJS = require('./utils')

class Crawler {
  constructor (ssoValidateServer, cookies) {
    this.browserArgs = ['--start-maximized', '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-plugins']
    this.globalError = ['WebDriverError', 'NoSuchWindowError', 'TypeError']
    this.highLayerError = ['NoSuchElementError']
    this.directThrowError = ['HousingReportNotFillError']

    this.By = webdriver.By
    this.until = webdriver.until
    this.creating = false
    this.created = false

    this.ssoValidateServer = ssoValidateServer
    this.cookies = cookies
    this.retryMaximum = 3

    this.ssoVisit = utilsJS.visit.bind(this)
    this.simpleErrorHandle = utilsJS.simpleErrorHandle.bind(this)
    this.ssoLogin = loginJS.login.bind(this)
    this.ssoFetchContracts = workStudyJS.fetchContracts.bind(this)
    this.ssoFetchYearSchedules = workStudyJS.fetchYearSchedules.bind(this)
    this.ssoAddWorkDiary = workStudyJS.addWorkDiary.bind(this)
  }

  initDriver (account, password) {
    return new Promise((resolve) => {
      this.creating = true
      this.account = account
      this.password = password

      this.driver = new webdriver.Builder()
        .withCapabilities({
          chromeOptions: {
            args: this.browserArgs
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
      return resolve(true)
    })
  }

  firstInitCrawl () {
    let result = {}
    return new Promise((resolve, reject) => {
      return this.ssoFetchContracts().then((contracts) => {
        result.contracts = contracts
        return this.ssoFetchYearSchedules()
      }).then((schedules) => {
        result.schedules = schedules
        return resolve(result)
      }).catch((err) => {
        return reject(err)
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

  get (url, retryCounter) {
    retryCounter = retryCounter || 0
    /*
    if (this.driver === undefined || this.driver == null) {
      return this.initDriver(this.account, this.password).then(() => {
        return this.get(url)
      })
    } else {
    */
    return this.driver.get(url).catch(() => {
      return this.simpleErrorHandle()
    }).catch((err) => {
      if (this.globalError.includes(err.name) && retryCounter < this.retryMaximum) {
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
    return this.driver.getCurrentUrl().catch(() => {
      return this.simpleErrorHandle()
    }).catch((err) => {
      if (this.globalError.includes(err.name) && retryCounter < this.retryMaximum) {
        return this.initDriver(this.account, this.password).then(() => {
          return this.getCurrentUrl(retryCounter + 1)
        })
      }
      throw err
    })
  }

  findElement (locator, retryCounter) {
    retryCounter = retryCounter || 0
    return this.driver.findElement(locator).catch(() => {
      return this.simpleErrorHandle()
    }).catch((err) => {
      if (this.globalError.includes(err.name) && retryCounter < this.retryMaximum) {
        return this.initDriver(this.account, this.password).then(() => {
          return this.findElement(locator, retryCounter + 1)
        })
      }
      throw err
    })
  }

  findElements (locator, retryCounter) {
    retryCounter = retryCounter || 0
    return this.driver.findElements(locator).catch(() => {
      return this.simpleErrorHandle()
    }).catch((err) => {
      if (this.globalError.includes(err.name) && retryCounter < this.retryMaximum) {
        return this.initDriver(this.account, this.password).then(() => {
          return this.findElements(locator, retryCounter + 1)
        })
      }
      throw err
    })
  }

  waitForUrl (url, millisecond) {
    return this.driver.wait(this.until.urlIs(url), millisecond || 5000).catch(() => {
      return this.simpleErrorHandle()
    }).then(() => {
      return {'success': true}
    }).catch((err) => {
      return {'fail': true, 'reason': err}
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
