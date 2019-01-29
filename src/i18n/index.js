const path = require('path')
const fs = require('fs')
const format = require('string-format')

class I18n {
  constructor () {
    this.locale = 'en_US'
    this.lang = {
      'UI': 'UserInterface(Renderer)',
      'UI.BtnSubmit': 'Submit',
      'UI.BtnClear': 'Clear',
      'UI.BtnCancel': 'Cancel',

      'UI.Login': 'Login Component',
      'UI.Login.LblAccount': 'Account',
      'UI.Login.LblStudentID': 'StudentID',
      'UI.Login.LblPassword': 'Password',
      'UI.Login.BtnLogining': 'Logining...',

      'TO': 'Tosted',
      'TO.LoginSuccess': 'Login Success!',
      'TO.LoginFail': 'Login Fail: {0}',
      'TO.UrlNavigateSuccess': 'URL Navigate Success!',
      'TO.UrlNavigateFail': 'URL Navigate Fial: {0}',
      'TO.FetchContractsSuccess': 'Fetch Contracts Success!',
      'TO.FetchContractsFail': 'Fetch Contracts Fail: {0}',
      'TO.FetchYearSchedulesSuccess': 'Fetch Year Schedules Success!',
      'TO.FetchYearSchedulesFail': 'Fetch Year Schedules Fail: {0}',

      'NO': 'Notifier',
      'NO.LoginSuccess': 'Login Success!',
      'NO.LoginFail': 'Login Fail: {0}',
      'NO.UrlNavigateSuccess': 'URL Navigate Success!',
      'NO.UrlNavigateFail': 'URL Navigate Fial: {0}',
      'NO.FetchContractsSuccess': 'Fetch Contracts Success!',
      'NO.FetchContractsFail': 'Fetch Contracts Fail: {0}',
      'NO.FetchYearSchedulesSuccess': 'Fetch Year Schedules Success!',
      'NO.FetchYearSchedulesFail': 'Fetch Year Schedules Fail: {0}',

      'UnknownLangKey': 'Unknown Language Key'
    }
    this.loadLocale()
  }

  loadLocale (locale, folder) {
    if (locale !== undefined && locale !== 'en_US' && folder !== undefined) {
      let localePath = path.join(folder, locale + '.json')
      fs.readFile(localePath, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          this.locale = locale
          this.localePath = localePath
          this.lang = JSON.parse(data)
        }
      })
    }
  }

  loadLocaleAsync (locale, folder) {
    return new Promise((resolve, reject) => {
      if (locale !== undefined && locale !== 'en_US' && folder !== undefined) {
        let localePath = path.join(folder, 'i18n', locale + '.json')
        return new Promise((resolve, reject) => {
          fs.readFile(localePath, 'utf-8', (err, data) => {
            return err ? reject(err) : resolve(data)
          })
        }).then((data) => {
          this.locale = locale
          this.localePath = localePath
          this.lang = JSON.parse(data)
          return resolve({locale: this.locale, localePath: this.localePath})
        }).catch((err) => {
          return reject(err)
        })
      }
      return resolve({locale: this.locale, localePath: 'InBoundLanguage'})
    })
  }

  t (key, ...args) {
    return this.lang[key] !== undefined ? format(this.lang[key], args) : this.lang['UnknownLangKey']
  }
}

export default I18n
