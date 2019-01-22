<template>
  <div>
    <modal name="modify-task" height="auto">
      <div class="container">
        <h3>Modify Tasks</h3>
        <table class="table tb-font-14">
          <thead>
            <tr>
              <th>Action</th>
              <th>Name</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(each, index) in this.tasks" :key="index">
              <td>
                <div v-if="editing === -1">
                  <button @click="removeTask(each)">
                    <i class="fas fa-times-circle"></i>
                  </button>
                  <button @click="editTask(each, index)">
                    <i class="fas fa-pen"></i>
                  </button>
                </div>
                <div v-else>Editing...</div>
              </td>
              <td>{{ each.contract.name }}</td>
              <td>{{ each.contract.start_date }}</td>
              <td>{{ each.contract.end_date }}</td>
            </tr>
          </tbody>
        </table>
        <form class="form-horizontal">
          <div class="form-group row">
            <label class="col-sm-3">Available Contract</label>
            <select v-model="selected.contract" class="form-control col-sm">
              <option v-for="(each, index) in availableContracts" :key="index" :value="each">
                {{ each.name }}
              </option>
            </select>
          </div>
          <div class="form-group row">
            <label class="col-sm-3">Select Week</label>
            <div class="col-sm row">
              <div v-for="(each, index) in this.selected.weeks" :key="index">
                <button class="btn btn-sm btn-primary" v-bind:class="{ disabled: each }" @click="setWeek(index)">
                  {{ getWeekName(index) }}
                </button>&nbsp;
              </div>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-3">Start time</label>
            <select v-model="selected.startTime.hour" class="form-control col-sm-3">
              <option v-for="index in 24" :key="index">{{ index - 1 }}</option>
            </select>
            <label class="col-sm-1">:</label>
            <select v-model="selected.startTime.minute" class="form-control col-sm-3">
              <option v-for="index in 60" :key="index">{{ index - 1 }}</option>
            </select>
          </div>
          <div class="form-group row">
            <label class="col-sm-3">End time</label>
            <select v-model="selected.endTime.hour" class="form-control col-sm-3">
              <option v-for="index in 24" :key="index">{{ index - 1 }}</option>
            </select>
            <label class="col-sm-1">:</label>
            <select v-model="selected.endTime.minute" class="form-control col-sm-3">
              <option v-for="index in 60" :key="index">{{ index - 1 }}</option>
            </select>
          </div>
          <div class="form-group row">
            <label class="col-sm-3">Description</label>
            <input v-model="selected.description" class="form-control col-sm" type="text"/>
          </div>
          <div v-if="editing !== -1" class="form-group">
            <input @click="confirmEditTask" type="submit" class="btn btn-sm btn-primary" value="Edit"/>
            <input @click="cancelEditTask" type="button" class="btn btn-sm btn-warning" value="Cancel"/>
          </div>
          <div v-else>
            <input @click="addTask" type="submit" class="btn btn-sm btn-primary" value="Add"/>
            <input type="reset" class="btn btn-sm btn-info" value="Reset"/>
          </div>
      </form>
      </div>
    </modal>
  </div>
</template>

<script>
export default {
  name: 'modify-task',
  data () {
    return {
      tasks: [],
      availableContracts: [],
      editing: -1,
      selected: {
        contract: {},
        weeks: {
          '0': false,
          '1': false,
          '2': false,
          '3': false,
          '4': false,
          '5': false,
          '6': false
        },
        startTime: {
          hour: 0,
          minute: 0
        },
        endTime: {
          hour: 0,
          minute: 0
        },
        description: ''
      }
    }
  },
  mounted () {
    this.tasks = this.$saves.data.tasks || []
    this.availableContracts = this.getAvaliableContracts()
    if (this.tasks === []) {
      this.$toasted.info('No tasks founded!')
    }
  },
  methods: {
    savesAllTasks () {
      this.$saves.data.tasks = this.tasks
      this.$saves.writeSaves()
    },
    resetSelected () {
      this.selected = {
        contract: {},
        weeks: {
          '0': false,
          '1': false,
          '2': false,
          '3': false,
          '4': false,
          '5': false,
          '6': false
        },
        startTime: {
          hour: 0,
          minute: 0
        },
        endTime: {
          hour: 0,
          minute: 0
        },
        description: ''
      }
      this.savesAllTasks()
    },
    getAvaliableContracts () {
      let today = new Date()
      let allContracts = []

      this.$saves.data.contracts.forEach((each) => {
        if (today <= new Date(each.end_date)) {
          allContracts.push(each)
        }
      })

      this.tasks.forEach((each) => {
        let search = allContracts.indexOf(each.contract)
        if (search !== -1) {
          allContracts.splice(search, 1)
        }
      })
      this.availableContracts = allContracts
      return this.availableContracts
    },
    getWeekName (index) {
      return ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'][index]
    },
    setWeek (index) {
      this.selected.weeks[index] = !this.selected.weeks[index]
    },
    taskValidate (task) {
      task = task || this.selected
      let start = parseInt(task.startTime.hour) * 60 + parseInt(task.startTime.minute)
      let end = parseInt(task.endTime.hour) * 60 + parseInt(task.endTime.minute)
      if (start >= end) {
        this.$toasted.error('Wrong start time or end time, end time should greater than start.')
      } else if (task.description === '') {
        this.$toasted.error('Missing decription.')
      } else {
        return true
      }
      return false
    },
    addTask () {
      if (this.taskValidate()) {
        this.tasks.push(this.selected)
        this.getAvaliableContracts()
        this.resetSelected()
      }
    },
    confirmEditTask () {
      if (this.taskValidate()) {
        this.editing = -1
        this.resetSelected()
      }
    },
    cancelEditTask () {
      this.editing = -1
      let search = this.availableContracts.indexOf(this.selected.contract)
      this.availableContracts.splice(search, 1)
      this.resetSelected()
    },
    removeTask (element) {
      let search = this.tasks.indexOf(element)
      if (search !== -1) {
        this.tasks.splice(search, 1)
        this.getAvaliableContracts()
        this.savesAllTasks()
      }
    },
    editTask (element, index) {
      this.editing = index
      this.selected = element
      this.availableContracts.push(element.contract)
    }
  }
}
</script>

<style scope>
  .tb-font-14 {
    font-size: 14px;
  }
</style>
