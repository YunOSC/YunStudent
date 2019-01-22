<template>
  <div>
    <modify-task/>
    <table class="table table-striped">
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
    <button @click="fetchContract" class="btn btn-sm btn-primary">FetchContract</button>
    <button @click="$modal.show('modify-task')" class="btn btn-sm btn-primary">Modify Task</button>
    <router-link to="dashboard" class="btn btn-sm btn-primary">Dashboard</router-link>
  </div>
</template>

<script>
import ModifyTask from './ModifyTask'
export default {
  name: 'workd-study',
  components: { ModifyTask },
  data: function () {
    return {
      contracts: []
    }
  },
  created: function () {
    this.contracts = this.$saves.data.contracts
    if (this.contracts === undefined || this.contracts == null || this.contracts.length === 0) {
      this.fetchContract()
    }
  },
  methods: {
    fetchContract: function () {
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
        this.$saves.data.contracts = this.contracts
        this.$saves.writeSaves()
        this.$toasted.success('Fetch contracts success!')
      }).catch((err) => {
        this.$toasted.error('Fetch contracts fail!')
        console.log(err)
      })
    }
  }
}
</script>
