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
    <a @click="fetchYearSchedule" type="button">aa</a>
    <a @click="fetchContract" type="button">aabb</a>
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
    }
  },
  mounted () {
    this.contracts = this.$root.saves.contracts || this.contracts
    this.tasks = this.$root.saves.tasks || this.tasks
    this.schedules = this.$root.saves.schedules || this.schedules
    this.getAvaliableContract()
  },
  methods: {
    fetchContract () {
      this.$mainIpc.send('req-crawl-available-contracts')
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
    fetchYearSchedule () {
      this.$mainIpc.send('req-crawl-year-schedules')
    }
  }
}
</script>
