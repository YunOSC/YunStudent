const http = require('axios')

export function login (redirect, retryCounter, visitRetryCounter) {
  retryCounter = retryCounter || 0
  console.log('login: ' + retryCounter + ' visit: ' + visitRetryCounter)
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
      return this.driver.sleep(500).then(() => {
        let failMsg = this.By.xpath('//*[@id="messagebox-1001-displayfield-inputEl"]')
        let failBtn = this.By.xpath('//*[@id="button-1005-btnInnerEl"]')
        return this.driver.findElement(failMsg).then((element) => {
          return element.getText().then((text) => {
            return this.driver.findElement(failBtn).then((element) => {
              element.click()
              if (text.includes('Authentication failed.')) {
                return resolve({'fail': true, 'reason': 'Authentication failed'})
              } else if (text.includes('Invalid validation code.')) {
                if (retryCounter < this.retryMaximum) {
                  return this.ssoLogin(redirect, retryCounter + 1, visitRetryCounter).then((result) => resolve(result))
                } else {
                  return resolve({'fail': true, 'reason': 'Retry counter exceed quota: Invalid validation code'})
                }
              } else {
                return resolve({'fail': true, 'reason': 'Unknown'})
              }
            })
          })
        }).catch(() => {
          return this.getCurrentUrl().then((url) => {
            if (url === redirect) {
              return resolve({'success': true})
            } else {
              return this.get(redirect).then(() => {
                return resolve({'success': true})
              })
            }
          })
        })
      })
    }).catch((err) => {
      if (retryCounter < this.retryMaximum && this.highLayerError.includes(err.name)) {
        return this.driver.sleep(1000).then(() => {
          return this.ssoLogin(redirect, retryCounter + 1, visitRetryCounter).catch((err) => {
            return reject(err)
          })
        })
      }
      return reject(err)
    })
  })
}
