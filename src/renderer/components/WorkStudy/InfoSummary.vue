<template>
  <div class="container">
    <table class="table table-striped" style="display: none;">
      <thead>
        <tr>
          <th>Start</th>
          <th>End</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(each, index) in contracts" :key="index">
          <td>{{ each.start_date }}</td>
          <td>{{ each.end_date }}</td>
          <td>{{ each.name }}</td>
        </tr>
      </tbody>
    </table>
    <button @click="fetchContract" class="btn btn-sm btn-primary" style="display: none;">FetchContract</button>
    <div>
      <div class="form-group">
        <label class="col-2">Contracts </label>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :style="'width: ' + (avaliableContract.length / contracts.length) * 100 + '%'">
            {{ avaliableContract.length }} / {{ contracts.length }}
          </div>
        </div>
        <small>This shows how many contracts not expired.</small>
      </div>
      <div class="form-group">
        <label class="col-1">Tasks</label>
        <button @click="$modal.show('modify-task')" class="btn btn-sm btn-primary" style="float: right;">
          <i class="fas fa-cogs fa-xs"></i>
        </button>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%">
            {{ tasks.length }} / {{ tasks.length }}
          </div>
        </div>
      </div>
    </div>
    <a @click="getYearSchedule" type="button">aa</a>
  </div>
</template>

<script>
export default {
  name: 'info-summary',
  data () {
    return {
      contracts: [],
      avaliableContract: [],
      tasks: [],
      schedules: []
    }
  },
  watch: {
    '$root.saves' (value) {
      this.contracts = value.contracts || this.contracts
      this.tasks = value.tasks || this.tasks
      this.schedules = value.schedules || this.schedules
      this.getAvaliableContract()

      if (this.contracts === undefined || this.contracts == null || this.contracts.length === 0) {
        this.fetchContract()
      }
    }
  },
  mounted () {
    this.contracts = this.$root.saves.contracts || this.contracts
    this.tasks = this.$root.saves.tasks || this.tasks
    this.schedules = this.$root.saves.schedules || this.schedules
    this.getAvaliableContract()

    if (this.contracts === undefined || this.contracts == null || this.contracts.length === 0) {
      this.fetchContract()
    }
  },
  methods: {
    fetchContract () {
      let crawler = this.$crawler
      return crawler.visit('https://webapp.yuntech.edu.tw/workstudy/Stud/JobList').then(() => {
        let pageLocator = crawler.By.xpath('//*[@id="page-wrapper"]')
        return crawler.driver.wait(crawler.until.elementsIsPresent(pageLocator), 5000).then(() => {
          return crawler.visit('https://webapp.yuntech.edu.tw/workstudy/Stud/ContractList')
        })
      }).then(() => {
        let tableLocator = crawler.By.xpath('//table[@id="mainTable"]/tbody/tr')
        return crawler.driver.wait(crawler.until.elementsIsPresent(tableLocator), 5000).then(() => {
          return crawler.findElements(tableLocator)
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
      }).then((contracts) => {
        this.contracts = contracts
        this.$root.saves.data.contracts = this.contracts
        this.$root.writeToSaves()
        this.$toasted.success('Fetch contracts success!')
      }).catch((err) => {
        this.$toasted.error('Fetch contracts fail!')
        console.log(err)
      })
    },
    getAvaliableContract () {
      let today = new Date()
      let allContracts = []
      this.contracts.forEach((each) => {
        if (today < new Date(each.end_date)) {
          allContracts.push(each)
        }
      })
      this.avaliableContract = allContracts
    },
    getYearSchedule () {
      this.$crawler.visit('https://webapp.yuntech.edu.tw/workstudy/Stud/DayJobSchedule').then(() => {
        return this.$crawler.driver.getPageSource()
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
        this.$root.saves.schedules = scheduleArray
        this.$root.writeToSaves()
        this.$toasted.success('Fetch Schedule success!')
      })
    }
  }
}
</script>
