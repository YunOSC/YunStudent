class MainIpc {
  constructor (i18n, ipc, notifier, window, saves, crawler) {
    this.i18n = i18n
    this.ipc = ipc
    this.notifier = notifier
    this.window = window
    this.saves = saves
    this.crawler = crawler

    this.ipc.on('renderer-created', (event, data) => this.rendererCreated(event, data))
    this.ipc.on('req-write-saves', (event, data) => this.reqWriteSaves(event, data))
    this.ipc.on('req-read-saves', (event, data) => this.reqReadSaves(event, data))
    this.ipc.on('req-login', (event, data) => this.reqLogin(event, data))
    this.ipc.on('req-logout', (event, data) => this.reqLogout(event, data))
    this.ipc.on('req-navigate-url', (event, data) => this.reqNavigateUrl(event, data))
    this.ipc.on('req-crawl-available-contracts', (event, data) => this.reqCrawlAvailableContracts(event, data))
    this.ipc.on('req-crawl-year-schedules', (event, data) => this.reqCrawlYearSchedules(event, data))
  }

  finalRtnNotify (resKey, result) {
    this.window.webContents.send(resKey, result)
    if (!this.window.isVisible()) {
      this.notifier(this.i18n.t(result.i18n, result.reason))
    }
    if (result.success === undefined) {
      console.log(this.i18n.t(result.i18n, result.reason))
    }
  }

  rendererCreated (event, data) {
    this.window.webContents.send('send-saves', this.saves.data)
  }

  reqWriteSaves (event, data) {
    this.saves.data = data
    this.saves.writeSaves()
    this.window.webContents.send('update-saves', this.saves.data)
  }

  reqReadSaves (event, data) {
    this.saves.readSaves().then(() => {
      this.window.webContents.send('update-saves', this.saves.data)
    })
  }

  reqLogin (event, data) {
    let tempLogin = {
      'account': this.crawler.account,
      'password': this.crawler.password
    }

    this.crawler.account = data.account
    this.crawler.password = data.password
    this.crawler.ssoVisit('https://webapp.yuntech.edu.tw/YunTechSSO/').then((result) => {
      if (result) {
        this.saves.data.login = data
        this.saves.writeSaves()
        return {'success': true, 'i18n': 'NO.LoginSuccess'}
      } else {
        return {'fail': true, 'reason': 'Unknwon', 'i18n': 'NO.LoginFail'}
      }
    }).catch((err) => {
      this.crawler.account = tempLogin.account
      this.crawler.password = tempLogin.password
      return {'fail': true, 'reason': err, 'i18n': 'No.LoginFail'}
    }).then((finalRtn) => {
      this.finalRtnNotify('res-login', finalRtn)
    })
  }

  reqLogout (event, data) {
    this.crawler.account = ''
    this.crawler.password = ''
    this.saves.writeSaves()
  }

  reqNavigateUrl (event, data) {
    this.crawler.ssoVisit(data.url).then((result) => {
      if (result) {
        return {'success': true, 'i18n': 'NO.UrlNavigateSuccess'}
      } else {
        return {'fail': true, 'reason': 'Unknown', 'i18n': 'NO.UrlNavigateFail'}
      }
    }).catch((err) => {
      return {'fail': true, 'reason': err, 'i18n': 'NO.UrlNavigateFail'}
    }).then((finalRtn) => {
      this.finalRtnNotify('res-navigate-url', finalRtn)
    })
  }

  reqCrawlAvailableContracts (event, data) {
    this.crawler.ssoFetchContracts().then((contracts) => {
      this.saves.data.contracts = contracts
      this.saves.writeSaves()
      return {
        'success': true,
        'data': {
          'contracts': contracts
        },
        'i18n': 'NO.FetchContractsSuccess'
      }
    }).catch((err) => {
      return {'fail': true, 'reason': err, 'i18n': 'NO.FetchContractsFail'}
    }).then((finalRtn) => {
      this.finalRtnNotify('res-crawl-available-contracts', finalRtn)
    })
  }

  reqCrawlYearSchedules (event, data) {
    this.crawler.ssoFetchYearSchedules().then((schedules) => {
      this.saves.data.schedules = schedules
      this.saves.writeSaves()
      return {
        'success': true,
        'data': {
          'schedules': schedules
        },
        'i18n': 'NO.FetchYearSchedulesSuccess'
      }
    }).catch((err) => {
      return {'fail': true, 'reason': err, 'i18n': 'NO.FetchYearSchedulesFail'}
    }).then((finalRtn) => {
      this.finalRtnNotify('res-crawl-year-schedules', finalRtn)
    })
  }
}

export default MainIpc
