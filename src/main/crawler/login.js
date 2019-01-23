const http = require('axios')

export function login (crawler, redirect, retryCounter, visitRetryCounter) {
  retryCounter = retryCounter || 0
  console.log('login: ' + retryCounter + ' visit: ' + visitRetryCounter)
  return new Promise((resolve, reject) => {
    return crawler.getCurrentUrl((url) => {
      if (redirect === undefined || redirect == null) {
        return crawler.get('https://webapp.yuntech.edu.tw/YunTechSSO/Account/Login')
      }
    }).then(() => {
      // Fetch validation code from backend.
      let validationCode = crawler.By.xpath('//img[@id="ValidationImage"]')
      return crawler.driver.wait(crawler.until.elementsIsPresent(validationCode), 5000).then(() => {
        return crawler.findElement(validationCode).then((element) => {
          return element.takeScreenshot()
        })
      }).then((base64Img) => {
        return http({
          url: crawler.ssoValidateServer + '/validationCode/base64',
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: {image: base64Img}
        }).then((response) => {
          return response.data.success !== undefined ? response.data : response.data
        })
      })
    }).then((codeData) => {
      // Fill in form datas
      return crawler.findElement(crawler.By.xpath('//*[@id="pLoginName-inputEl"]')).then((element) => {
        // Account
        element.clear()
        return element.sendKeys(crawler.account).then(() => {
          return crawler.findElement(crawler.By.xpath('//*[@id="pLoginPassword-inputEl"]'))
        })
      }).then((element) => {
        // Password
        element.clear()
        return element.sendKeys(crawler.password).then(() => {
          return crawler.findElement(crawler.By.xpath('//*[@id="pSecretString-inputEl"]'))
        })
      }).then((element) => {
        // Validation Code
        element.clear()
        return element.sendKeys(codeData.code).then(() => {
          return crawler.findElement(crawler.By.xpath('//*[@id="LoginButton-btnInnerEl"]'))
        })
      })
    }).then((loginBtn) => {
      loginBtn.click()
      return crawler.driver.sleep(1000).then(() => {
        let failBtn = crawler.By.xpath('//*[@id="button-1005-btnInnerEl"]')
        return crawler.driver.findElement(failBtn).then((element) => {
          element.click()
          return crawler.ssoLogin(redirect, retryCounter + 1)
        }).catch(() => {
          return crawler.getCurrentUrl()
        })
      })
    }).then((url) => {
      if (url === redirect) {
        return resolve(true)
      } else {
        return crawler.get(redirect).then(() => {
          return resolve(true)
        })
      }
    }).catch((err) => {
      if (retryCounter < crawler.retryMaximum && crawler.highLayerError.includes(err.name)) {
        return crawler.driver.sleep(1000).then(() => {
          return crawler.ssoLogin(redirect, retryCounter + 1, visitRetryCounter).catch((err) => {
            return reject(err)
          })
        })
      }
      return reject(err)
    })
  })
}
