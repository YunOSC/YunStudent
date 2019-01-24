const path = require('path')
const fs = require('fs')
const format = require('string-format')

class I18n {
  constructor () {
    this.locale = 'en_US'
    this.lang = {
      'UI': 'UserInterface(Renderer)',
      'UI.Button.Login': 'Login',
      'UI.Button.Cancel': 'Cancel',
      'UI.Button.Clear': 'Clear',

      'TO': 'Tosted',
      'TO.LoginSuccess': 'Login Success!',
      'TO.LoginFail': 'Login Fail: {0}',
      'TO.UrlNavigateSuccess': 'URL Navigate Success!',
      'To.UrlNavigateFail': 'URL Navigate Fial: {0}',
      'TO.FetchContractsSuccess': 'Fetch Contracts Success!',
      'TO.FetchContractsFail': 'Fetch Contracts Fail: {0}',
      'TO.FetchYearSchedulesSuccess': 'Fetch Year Schedules Success!',
      'TO.FetchYearSchedulesFail': 'Fetch Year Schedules Fail: {0}',

      'NO': 'Notifier',
      'NO.LoginSuccess': 'Login Success!',
      'NO.LoginFail': 'Login Fail: {0}',
      'NO.UrlNavigateSuccess': 'URL Navigate Success!',
      'No.UrlNavigateFail': 'URL Navigate Fial: {0}',
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

  t (key, ...args) {
    return this.lang[key] !== undefined ? format(this.lang[key], args) : this.lang['UnknownLangKey']
  }
}

export default I18n
