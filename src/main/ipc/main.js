class MainIpc {
  constructor (ipc, window, saves, crawler) {
    this.ipc = ipc
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
        this.window.webContents.send('res-login', {'success': true})
      } else {
        this.window.webContents.send('res-login', {'fail': true, 'reason': 'Unknwon'})
      }
    }).catch((err) => {
      this.crawler.account = tempLogin.account
      this.crawler.password = tempLogin.password
      this.window.webContents.send('res-login', {'fail': true, 'reason': err})
      console.log(err)
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
        this.window.webContents.send('res-navigate-url', {'success': true})
      } else {
        this.window.webContents.send('res-navigate-url', {'fail': true, 'reason': 'Unknown'})
      }
    }).catch((err) => {
      this.window.webContents.send('res-navigate-url', {'fail': true, 'reason': err})
      console.log(err)
    })
  }

  reqCrawlAvailableContracts (event, data) {
    this.crawler.ssoFetchContracts().then((contracts) => {
      this.saves.data.contracts = contracts
      this.saves.writeSaves()
      this.window.webContents.send('res-crawl-available-contracts', {
        'success': true,
        'data': {
          'contracts': contracts
        }
      })
    }).catch((err) => {
      this.window.webContents.send('res-crawl-available-contracts', {'fail': true, 'reason': err})
      console.log(err)
    })
  }

  reqCrawlYearSchedules (event, data) {
    this.crawler.ssoFetchYearSchedules().then((schedules) => {
      this.saves.data.schedules = schedules
      this.saves.writeSaves()
      this.window.webContents.send('res-crawl-year-schedules', {
        'success': true,
        'data': {
          'schedules': schedules
        }
      })
    }).catch((err) => {
      this.window.webContents.send('res-crawl-year-schedules', {'fail': true, 'reason': err})
      console.log(err)
    })
  }
}

export default MainIpc
