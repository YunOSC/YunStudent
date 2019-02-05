import HousingReportNotFillError from './errors/HousingReportNotFillError'
import UnknownError from './errors/UnknownError'

export function simpleErrorHandle () {
  return new Promise((resolve, reject) => {
    this.driver.getPageSource().then((src) => {
      if (src.includes('Student Housing Report')) {
        return reject(new HousingReportNotFillError())
      } else {
        return reject(new UnknownError())
      }
    })
  })
}

export function visit (url, retryCounter) {
  retryCounter = retryCounter || 0
  console.log('visit: ' + retryCounter + ' url: ' + url)
  return this.getCurrentUrl().then((currentUrl) => {
    return url === currentUrl
  }).then((result) => {
    if (result) {
      return true
    } else {
      return this.get(url).then(() => {
        return this.ssoLogin(url, undefined, retryCounter)
      })
    }
  }).then((loginResult) => {
    if (loginResult.success !== undefined) {
      return this.waitForUrl(url)
    } else {
      return loginResult
    }
  }).catch((err) => {
    if (!this.directThrowError.includes(err.name) && retryCounter < this.retryMaximum) {
      if (this.globalError.includes(err.name)) {
        return this.initDriver(this.account, this.password).then(() => {
          return this.driver.sleep(1000)
        }).then(() => {
          return this.ssoVisit(url, retryCounter + 1)
        }).catch((err) => {
          // Extract the inner reject.
          throw err
        })
      } else {
        return this.ssoVisit(url, retryCounter + 1).catch((err) => {
          // Extract the inner reject.
          throw err
        })
      }
    }
    throw err
  })
}
