export async function fetchContracts () {
  // Locating contracts list.
  await this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/Stud/JobList')
  await this.page.waitForXPath('//*[@id="page-wrapper"]')
  await this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/Stud/ContractList')
  await this.page.waitForXPath('//table[@id="mainTable"]/tbody/tr')

  // Fetch contract and push to array.
  let contracts = []
  const tableEls = await this.page.$x('//table[@id="mainTable"]/tbody/tr')
  for (let tableEl of tableEls) {
    let text = await (await tableEl.getProperty('textContent')).jsonValue()
    let textArr = text.split('\n                    ')
    contracts.push({
      'start_date': textArr[1],
      'end_date': textArr[2],
      'name': textArr[3],
      'host': textArr[4],
      'moderator': textArr[5],
      'disability': textArr[6],
      'type': textArr[7],
      'salaries': textArr[8],
      'evaluation_hours': textArr[9].replace(' ', ''),
      'create_datetime': textArr[10].substring(1)
    })
  }
  return contracts
}

export async function fetchYearSchedules () {
  await this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/Stud/DayJobSchedule')
  const sourceCode = await this.page.content()
  let yearTable = sourceCode.match(/<!--\n<table[^]*<th>工作日期<\/th><th>開始時間<\/th><th>結束時間<\/th><th>工作單位<\/th><th>經辦人<\/th><th>工時\(hrs\)<\/th><th>工作地點<\/th>[^]*<\/table>\n *-->/g)[0]
  let scheduleTable = yearTable.match(/<tr>[^]*?<\/tr>/g)
  scheduleTable.splice(0, 1)

  let tempArray = []
  let scheduleArray = []
  scheduleTable.forEach((each) => {
    tempArray = each.match(/<td>[^]*?<\/td>/g)
    scheduleArray.push({
      'date': tempArray[0].substring(4, tempArray[0].indexOf('</td>')),
      'start_time': tempArray[1].substring(4, tempArray[1].indexOf('</td>')).replace(' ', ''),
      'end_time': tempArray[2].substring(4, tempArray[2].indexOf('</td>')).replace(' ', ''),
      'work_unit': tempArray[3].substring(4, tempArray[3].indexOf('</td>')),
      'moderator': tempArray[4].substring(4, tempArray[4].indexOf('</td>')),
      'duration': tempArray[5].substring(4, tempArray[5].indexOf('</td>')).replace(' ', ''),
      'location': tempArray[6].substring(4, tempArray[6].indexOf('</td>'))
    })
  })
  return scheduleArray
}
