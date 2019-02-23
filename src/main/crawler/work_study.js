export async function fetchContracts () {
  // Locating contracts list.
  await this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/Stud/JobList')
  await this.page.waitForXPath('//*[@id="page-wrapper"]')
  await this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/Stud/ContractList')
  await this.page.waitForXPath('//table[@id="mainTable"]/tbody/tr')

  // Fetch contract and push to array.
  return this.page.$$eval('table#mainTable > tbody > tr', (tables) => {
    let contracts = []
    for (let i = 0; i < tables.length; ++i) {
      const tds = tables[i].querySelectorAll('td')
      contracts.push({
        'start_date': tds[0].textContent,
        'end_date': tds[1].textContent,
        'name': tds[2].textContent,
        'host': tds[3].textContent,
        'moderator': tds[4].textContent,
        'disability': tds[5].textContent,
        'type': tds[6].textContent,
        'salaries': tds[7].textContent,
        'evaluation_hours': tds[8].textContent,
        'create_datetime': tds[9].textContent,
        'contract_id': tds[10].querySelector('span > a').href.split('ApplyId=')[1]
      })
    }
    return contracts
  })
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

export async function addWorkDiary (task) {
  return new Promise((resolve, reject) => {
    return (async () => {
      await this.page.once('dialog', (dialog) => dialog.accept())
      const visitResult = await this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/StudWorkRecord/Create')
      if (visitResult.success !== undefined) {
        await this.page.select('select#ApplyDate', new Date().toISOString().substring(0, 10).replace(/-/g, '/') + ',' + task.contract_id)
        await this.page.select('select#StartHour', '1')
        await this.page.select('select#StartMin', '1')
        await this.page.select('select#EndHour', '1')
        await this.page.select('select#EndMin', '1')
        await this.page.type('input#Work', task.description)

        return {'success': true}
      } else {
        return {'fail': true, 'reason': visitResult.reason}
      }
    })().catch((err) => {
      return reject(err)
    }).then((result) => {
      return resolve(result)
    })
  })
}
