const axios = require('axios')

export async function appFirstTimeLogin () {
  return new Promise(async (resolve, reject) => {
    let result = {}
    result.contracts = await this.ssoFetchContracts()
    result.schedules = await this.ssoFetchYearSchedules()
    return resolve(result)
  })
}

/**
 * Login function
 *  Actuall perform login to SSO.
 * @param {string} redirect optional, after login to redirect to.
 *  Adding this param will check url is it at last of function.
 *  Default is to check SSO index element exists or not.
 * @returns {object} login and redirect result(if redirect undefined).
 *  If success, object will contain 'success': true element.
 *  Or 'fail': true and 'reason': err.
 * @throws {error}
 *  If non of any error can catch by last waiting await.
 *  It will throws error by async function itself.
 *  Should be catch by callee.
 */
export async function login (redirect, retryCount) {
  return new Promise(async (resolve, reject) => {
    return (async () => {
      // Wait for validate image, fetch, and recognize.
      await this.page.waitForXPath('//img[@id="ValidationImage"]', {visible: true, timeout: 5000})
      await this.page.waitFor(100)
      let validateCode = '0000'
      await this.page.$x('//img[@id="ValidationImage"]').then((el) => {
        return el[0].screenshot({encoding: 'base64'})
      }).then((base64) => {
        return axios({
          url: this.ssoValidateServer + '/validationCode/base64',
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: {image: base64}
        }).then((response) => {
          if (response.data.success !== undefined) {
            validateCode = response.data.code
          } else {
            return {'fail': true, 'reason': response.data}
          }
        })
      })

      // Fill in login info.
      const accountEl = await this.page.$x('//*[@id="pLoginName-inputEl"]')
      const passwordEl = await this.page.$x('//*[@id="pLoginPassword-inputEl"]')
      const codeEl = await this.page.$x('//*[@id="pSecretString-inputEl"]')
      const btnEl = await this.page.$x('//*[@id="LoginButton-btnInnerEl"]')

      await accountEl[0].click({clickCount: 3})
      await accountEl[0].type(this.account)
      await passwordEl[0].click({clickCount: 3})
      await passwordEl[0].type(this.password)
      await codeEl[0].click({clickCount: 3})
      await codeEl[0].type(validateCode)
      await btnEl[0].click()
      await this.page.waitFor(1000)

      const errMsgEl = await this.page.$x('//*[@id="messagebox-1001-displayfield-inputEl"]')
      if (errMsgEl.length !== 0) {
        const text = await (await errMsgEl[0].getProperty('textContent')).jsonValue()
        let reason = 'Unknown'
        let retry = false
        if (text.includes('Account not exist or registered.')) {
          reason = 'Account not exist'
        } else if (text.includes('Authentication failed.')) {
          reason = 'Authentication failed'
        } else if (text.includes('Invalid validation code.')) {
          reason = 'Invalid validation code'
          retry = (retryCount || 0) <= this.maximumRetryCount
        }
        return {'fail': true, 'reason': reason, 'retry': retry}
      }
      return {'success': true}
    })().catch((err) => {
      return reject(err)
    }).then((loginResult) => {
      // console.log(retryCount + ' + ' + JSON.stringify(loginResult))
      if (loginResult.fail !== undefined) {
        if (loginResult.retry) {
          return this.ssoLogin(redirect, retryCount + 1)
        } else {
          loginResult.reason = 'Retry counter exceed quota: ' + loginResult.reason
        }
      }
      return resolve(loginResult)
    })
  })
}
