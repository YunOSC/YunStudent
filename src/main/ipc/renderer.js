export function sendSaves (vue, event, data) {
  vue.$data.saves = data
}

export function updateSaves (vue, event, data) {
  vue.$data.saves = data
}

export function resLogin (vue, event, data) {
  if (data.success !== undefined) {
    vue.$toasted.success('Login success!')
    vue.$router.push({'name': 'dashboard'})
  } else {
    vue.$toasted.error('Login Fail: ' + (data.reason !== undefined ? data.reason : data))
    console.log({'during': 'Login', 'reason': data})
  }
}

export function resLogout (vue, event, data) {}

export function resNavigateUrl (vue, event, data) {
  if (data.success !== undefined) {
    vue.$toasted.success('URL navigate success!')
  } else {
    vue.$toasted.error('NavigateURLError: ' + (data.reason !== undefined ? data.reason : data))
    console.log({'during': 'NavigateUrl', 'reason': data})
  }
}

export function resCrawlAvailableContracts (vue, event, data) {
  if (data.success !== undefined) {
    vue.$data.saves.contracts = data.data.contracts
    vue.$toasted.success('Fetch contracts success!')
  } else {
    vue.$toasted.error('FetchAvailableContractsError: ' + (data.reason !== undefined ? data.reason : data))
    console.log({'during': 'CrawlAvailableContracts', 'reason': data})
  }
}

export function resCrawlYearSchedules (vue, event, data) {
  if (data.success !== undefined) {
    vue.$data.schedules = data.data.schedules
    vue.$toasted.success('Fetch schedules success!')
  } else {
    vue.$toasted.error('FetchYearSchedulesError: ' + (data.reason !== undefined ? data.reason : data))
    console.log({'during': 'CrawlYearSchedules', 'reason': data})
  }
}
