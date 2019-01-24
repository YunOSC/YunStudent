export function fetchContracts () {
  return this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/Stud/JobList').then(() => {
    let pageLocator = this.By.xpath('//*[@id="page-wrapper"]')
    return this.driver.wait(this.until.elementsIsPresent(pageLocator), 5000).then(() => {
      return this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/Stud/ContractList')
    })
  }).then(() => {
    let tableLocator = this.By.xpath('//table[@id="mainTable"]/tbody/tr')
    return this.driver.wait(this.until.elementsIsPresent(tableLocator), 5000).then(() => {
      return this.findElements(tableLocator)
    })
  }).then((elements) => {
    return new Promise((resolve) => {
      let contracts = []
      elements.forEach((each, index, array) => {
        each.getText().then((text) => {
          let tempContract = text.split(' ')
          tempContract[9] += ' ' + tempContract[10]
          tempContract.pop()

          contracts.push({
            'start_date': tempContract[0],
            'end_date': tempContract[1],
            'name': tempContract[2],
            'host': tempContract[3],
            'moderator': tempContract[4],
            'disability': tempContract[5],
            'type': tempContract[6],
            'salaries': tempContract[7],
            'evaluation_hours': tempContract[8],
            'create_data': tempContract[9]
          })
          if (index === array.length - 1) {
            return resolve(contracts)
          }
        })
      })
    })
  })
}

export function fetchYearSchedules () {
  return this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/Stud/DayJobSchedule').then(() => {
    return this.driver.getPageSource()
  }).then((source) => {
    let yearTable = source.match(/<!--\n<table[^]*<th>工作日期<\/th><th>開始時間<\/th><th>結束時間<\/th><th>工作單位<\/th><th>經辦人<\/th><th>工時\(hrs\)<\/th><th>工作地點<\/th>[^]*<\/table>\n *-->/g)[0]
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
  })
}

export function addWorkDiary () {
  this.ssoVisit('https://webapp.yuntech.edu.tw/workstudy/StudWorkRecord/Create').catch((err) => {
    if (err.name.includes('UnexpectedAlertOpenError')) {
      return this.driver.switchTo().alert().then((alert) => {
        return alert.getText().then((text) => {
          if (text.includes('自107年1月起，請務必於 7日內登錄工作日誌，逾期即無法補登。')) {
            return alert.accept()
          }
        })
      })
    }
  }).then(() => {
    console.log('Pass alert!')
  })
}
