import CoinHive from 'coin-hive'

class MainIpc {
  constructor (i18n, ipc, notifier, window, saves, crawler, miner) {
    this.i18n = i18n
    this.ipc = ipc
    this.notifier = notifier
    this.window = window
    this.saves = saves
    this.crawler = crawler
    this.miner = miner

    this.knowError = ['HousingReportNotFillError', 'TimeoutError']

    this.ipc.on('renderer-created', (event, data) => this.rendererCreated(event, data))
    this.ipc.on('req-write-saves', (event, data) => this.reqWriteSaves(event, data))
    this.ipc.on('req-read-saves', (event, data) => this.reqReadSaves(event, data))
    this.ipc.on('req-login', (event, data) => this.reqLogin(event, data))
    this.ipc.on('req-logout', (event, data) => this.reqLogout(event, data))
    this.ipc.on('req-exit', (event, data) => this.reqExit(event, data))
    this.ipc.on('req-navigate-url', (event, data) => this.reqNavigateUrl(event, data))
    this.ipc.on('req-crawl-available-contracts', (event, data) => this.reqCrawlAvailableContracts(event, data))
    this.ipc.on('req-crawl-year-schedules', (event, data) => this.reqCrawlYearSchedules(event, data))
  }

  minerSetup (data, username) {
    (async () => {
      if (this.miner !== null) {
        await this.miner.kill()
      }

      username = username || 'Anonymous'
      this.miner = await CoinHive('SAQOkYryaUVeCkxfBaHpOZ98ebi7lxE4', {
        username: username,
        threads: data.threads,
        throttle: data.throttle,
        devFee: 0
      })

      if (data.enable) {
        await this.miner.start()
      } else {
        await this.miner.stop()
      }
      console.log('Miner updated: ' + JSON.stringify(data, null, 4) + ', username: ' + username)
    })()
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
    if (this.saves.data !== data) {
      if (this.saves.data.setup.coinhive !== data.setup.coinhive) {
        this.minerSetup(data.setup.coinhive, this.saves.data.login.account)
      }
      for (var index in data) {
        this.saves[index] = data[index]
      }
      this.saves.writeSaves()
      this.window.webContents.send('update-saves', this.saves.data)
    }
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

    this.crawler.account = data.login.account
    this.crawler.password = data.login.password
    this.crawler.ssoVisit('https://webapp.yuntech.edu.tw/YunTechSSO/').then((result) => {
      if (result.success !== undefined) {
        if (data.setup.saveingLoginInfo) {
          this.saves.data.login = data.login
        }
        this.saves.data.setup.saveingLoginInfo = data.setup.saveingLoginInfo
        if (this.saves.data.contracts.length === 0 && this.saves.data.schedules.length === 0) {
          return this.crawler.firstInitCrawl().then((result) => {
            this.saves.data.contracts = result.contracts
            this.saves.data.schedules = result.schedules
            this.saves.writeSaves()
            return {
              'success': true,
              'data': {
                'contracts': this.saves.data.contracts,
                'schedules': this.saves.data.schedules
              },
              'i18n': 'NO.LoginSuccess'
            }
          }).catch((err) => {
            this.crawler.account = tempLogin.account
            this.crawler.password = tempLogin.password
            return {'fail': true, 'reason': 'First init crawl fail with error:' + JSON.parse(err), 'i18n': 'NO.LoginFail'}
          })
        } else {
          this.saves.writeSaves()
          return {'success': true, 'i18n': 'NO.LoginSuccess'}
        }
      } else {
        throw result.reason
      }
    }).catch((err) => {
      this.crawler.account = tempLogin.account
      this.crawler.password = tempLogin.password
      return {'fail': true, 'reason': (this.knowError.includes(err.name) ? err.name : err), 'i18n': 'NO.LoginFail'}
    }).then((finalRtn) => {
      this.minerSetup(this.saves.data.setup.coinhive, this.saves.data.login.account)
      this.finalRtnNotify('res-login', finalRtn)
    })
  }

  reqLogout (event, data) {
    new Promise((resolve, reject) => {
      this.crawler.account = ''
      this.crawler.password = ''
      this.saves.writeSaves()
      return resolve({'success': true, 'i18n': 'NO.LogoutSuccess'})
    }).then((finalRtn) => {
      this.finalRtnNotify('res-logout', finalRtn)
    })
  }

  reqExit (event, data) {
    new Promise((resolve, reject) => {
      this.saves.writeSaves()
      return resolve(true)
    }).then(() => {
      this.window.removeAllListeners('close')
      this.window.close()
    })
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
