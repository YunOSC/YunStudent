<template>
  <div class="container">
    <!--table class="table table-striped" style="display: none;">
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
    </table-->
    <button @click="fetchContract" class="btn btn-sm btn-primary" style="display: none;">FetchContract</button>
    <div>
      <div class="form-group">
        <label class="col-4">{{ $t('UI.InfoSummary.LblContracts') }}</label>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :style="'width: ' + (avaliableContract.length / contracts.length) * 100 + '%'">
            {{ avaliableContract.length }} / {{ contracts.length }}
          </div>
        </div>
        <small>{{ $t('UI.InfoSummary.SmContractsHint') }}</small>
      </div>
      <div class="form-group">
        <label class="col-4">{{ $t('UI.InfoSummary.LblSchedules') }}</label>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :style="'width: ' + (passSchedule.length / schedules.length) * 100 + '%'">
            {{ passSchedule.length }} / {{ schedules.length }}
          </div>
          <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" :style="'width: ' + (currentSchedule.length / schedules.length) * 100 + '%'">
            {{ currentSchedule.length }} / {{ schedules.length }}
          </div>
        </div>
        <small>{{ $t('UI.InfoSummary.SmSchedulesHint') }}</small>
      </div>
      <div class="form-group">
        <label class="col-4">{{ $t('UI.InfoSummary.LblTasks') }}</label>
        <button @click="$modal.show('modify-task')" class="btn btn-sm btn-primary" style="float: right;">
          <i class="fas fa-cogs fa-xs"></i>
        </button>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%">
            {{ tasks.length }} / {{ tasks.length }}
          </div>
        </div>
        <small v-if="tasks.length === 0" style="color: red;">{{ $t('UI.InfoSummary.SmZeroTasksWarning') }}</small>
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
      schedules: [],
      avaliableSchedule: [],
      lessSchedule: [],
      currentSchedule: [],
      passSchedule: []
    }
  },
  watch: {
    '$root.saves' (value) {
      this.contracts = value.contracts || this.contracts
      this.tasks = value.tasks || this.tasks
      this.schedules = value.schedules || this.schedules
      this.getAvaliableContract()
      this.getAvaliableSchedule()
      this.getScheduleStatus()
    }
  },
  mounted () {
    this.contracts = this.$root.saves.contracts || this.contracts
    this.tasks = this.$root.saves.tasks || this.tasks
    this.schedules = this.$root.saves.schedules || this.schedules
    this.getAvaliableContract()
    this.getAvaliableSchedule()
    this.getScheduleStatus()
  },
  methods: {
    fetchContract () {
      this.$mainIpc.send('req-crawl-available-contracts')
    },
    getAvaliableSchedule () {
      let schedule = []
      this.schedules.forEach((each) => {
        let contain = false
        for (let i = 0; i < schedule.length; ++i) {
          if (schedule[i].location === each.location && schedule[i].work_unit === each.work_unit) {
            contain = true
            break
          }
        }
        if (!contain) {
          schedule.push({
            'location': each.location,
            'work_unit': each.work_unit
          })
        }
      })
      this.avaliableSchedule = schedule
    },
    getScheduleStatus () {
      this.lessSchedule = []
      this.currentSchedule = []
      this.passSchedule = []
      let today = new Date()
      this.schedules.forEach((each) => {
        let date = new Date(each.date)
        if (today < date) {
          this.lessSchedule.push(each)
        } else if (today === date) {
          this.currentSchedule.push(each)
        } else {
          this.passSchedule.push(each)
        }
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
    fetchYearSchedule () {
      this.$mainIpc.send('req-crawl-year-schedules')
    }
  }
}
</script>
