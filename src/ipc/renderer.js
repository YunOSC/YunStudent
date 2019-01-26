export function sendSaves (vue, event, data) {
  vue.$data.saves = data
}

export function updateSaves (vue, event, data) {
  vue.$data.saves = data
}

export function resLogin (vue, event, data) {
  if (data.success !== undefined) {
    vue.$toasted.success(vue.$t('TO.LoginSuccess'))
    vue.$router.push({'name': 'dashboard'})
  } else {
    vue.$toasted.error(vue.$t('TO.LoginFail', (data.reason !== undefined ? data.reason : data)))
    console.log({'during': 'Login', 'reason': data})
  }
}

export function resLogout (vue, event, data) {}

export function resNavigateUrl (vue, event, data) {
  if (data.success !== undefined) {
    vue.$toasted.success(vue.$t('TO.UrlNavigateSuccess'))
  } else {
    vue.$toasted.error(vue.$t('TO.UrlNavigateFail', (data.reason !== undefined ? data.reason : data)))
    console.log({'during': 'NavigateUrl', 'reason': data})
  }
}

export function resCrawlAvailableContracts (vue, event, data) {
  if (data.success !== undefined) {
    vue.$data.saves = {
      contracts: data.data.contracts
    }
    vue.$toasted.success(vue.$t('TO.FetchContractsSuccess'))
  } else {
    vue.$toasted.error(vue.$t('TO.FetchContractsFail', (data.reason !== undefined ? data.reason : data)))
    console.log({'during': 'CrawlAvailableContracts', 'reason': data})
  }
}

export function resCrawlYearSchedules (vue, event, data) {
  if (data.success !== undefined) {
    vue.$data.saves = {
      schedules: data.data.schedules
    }
    vue.$toasted.success(vue.$t('TO.FetchYearSchedulesSuccess'))
  } else {
    vue.$toasted.error(vue.$t('TO.FetchYearSchedulesFail'), (data.reason !== undefined ? data.reason : data))
    console.log({'during': 'CrawlYearSchedules', 'reason': data})
  }
}
