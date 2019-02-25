const puppeteer = require('puppeteer')

const loginJS = require('./login')
const workStudyJS = require('./work_study')
const utilsJS = require('./utils')

class Crawler {
  constructor (ssoValidateServer, maximumRetryCount) {
    this.ssoValidateServer = ssoValidateServer
    this.maximumRetryCount = maximumRetryCount || 3

    this.appFirstTimeLogin = loginJS.appFirstTimeLogin.bind(this)
    this.ssoLogin = loginJS.login.bind(this)
    this.ssoVisit = utilsJS.visit.bind(this)
    this.ssoFetchContracts = workStudyJS.fetchContracts.bind(this)
    this.ssoFetchYearSchedules = workStudyJS.fetchYearSchedules.bind(this)
    this.ssoAddWorkDiary = workStudyJS.addWorkDiary.bind(this)
  }

  async init (account, password) {
    this.account = account
    this.password = password
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox']
    })
    this.page = await this.browser.newPage()
    return true
  }

  async close () {
    await this.browser.close()
  }
}

export default Crawler
