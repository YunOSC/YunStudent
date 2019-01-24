export function visit (url, retryCounter) {
  retryCounter = retryCounter || 0
  console.log('visit: ' + retryCounter)
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
    if (loginResult) {
      return this.driver.wait(this.until.urlIs(url), 5000).then(() => {
        return true
      }).catch(() => {
        return false
      })
    } else {
      return false
    }
  }).catch((err) => {
    if (retryCounter < this.retryMaximum) {
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
