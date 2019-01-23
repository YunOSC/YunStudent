export function visit (crawler, url, retryCounter) {
  retryCounter = retryCounter || 0
  console.log('visit: ' + retryCounter)
  return new Promise((resolve, reject) => {
    return crawler.getCurrentUrl().then((currentUrl) => {
      return url === currentUrl
    }).then((result) => {
      if (result) {
        return resolve(true)
      } else {
        return crawler.get(url).then(() => {
          return crawler.ssoLogin(url, undefined, retryCounter)
        })
      }
    }).then((loginResult) => {
      if (loginResult) {
        return crawler.driver.wait(crawler.until.urlIs(url), 5000).then(() => {
          return resolve(true)
        }).catch(() => {
          return resolve(false)
        })
      } else {
        return resolve(false)
      }
    }).catch((err) => {
      if (retryCounter < crawler.retryMaximum) {
        if (crawler.globalError.includes(err.name)) {
          return crawler.initDriver(crawler.account, crawler.password).then(() => {
            return crawler.driver.sleep(1000)
          }).then(() => {
            return crawler.ssoVisit(url, retryCounter + 1)
          }).catch((err) => {
            // Extract the inner reject.
            return reject(err)
          })
        } else {
          return crawler.ssoVisit(url, retryCounter + 1).catch((err) => {
            // Extract the inner reject.
            return reject(err)
          })
        }
      }
      return reject(err)
    })
  })
}
