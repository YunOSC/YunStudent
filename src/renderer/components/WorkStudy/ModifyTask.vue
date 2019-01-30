<template>
  <div>
    <modal name="modify-task" height="auto">
      <div class="container">
        <div class="row" style="padding-top: 3%;">
          <div class="col-11">
            <h3>{{ $t('UI.ModifyTask.HdModifyTask') }}</h3>
          </div>
          <div>
            <button @click="$modal.hide('modify-task')">
              <i class="fas fa-times-circle"></i>
            </button>
          </div>
        </div>
        <div class="row">
          <table class="table tb-font-14">
            <thead>
              <tr>
                <th>{{ $t('UI.ModifyTask.TbHdAction') }}</th>
                <th>{{ $t('UI.ModifyTask.TbHdWorkUnit') }}</th>
                <th>{{ $t('UI.ModifyTask.TbHdLocation') }}</th>
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
                  <div v-else>{{ $t('UI.ModifyTask.TbTdEditing') }}</div>
                </td>
                <td>{{ each.schedule.work_unit }}</td>
                <td>{{ each.schedule.location }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <form class="form-horizontal">
          <div class="form-group row">
            <label class="col-3">{{ $t('UI.ModifyTask.FmLblAvailableSchedule') }}</label>
            <select v-model="selected.schedule" class="form-control col">
              <option v-for="(each, index) in availableSchedules" :key="index" :value="each">
                {{ each.location }}
              </option>
            </select>
          </div>
          <div class="form-group row">
            <label class="col-3">{{ $t('UI.ModifyTask.FmLblOffset') }}</label>
            <input v-model="selected.offset" class="form-contorl col-1" type="checkbox"/>
            <div class="row offset-1">
              <small>{{ $t('UI.ModifyTask.FmSmOffsetHint') }}</small>
              <small>{{ $t('UI.ModifyTask.FmSmOffsetHintExample') }}</small>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-3">{{ $t('UI.ModifyTask.FmLblDescription') }}</label>
            <input v-model="selected.description" class="form-control col" type="text"/>
          </div>
          <div v-if="editing !== -1" class="form-group">
            <input @click="confirmEditTask" type="button" class="btn btn-sm btn-primary" :value="$t('UI.ModifyTask.BtnEdit')"/>
            <input @click="cancelEditTask" type="button" class="btn btn-sm btn-warning" :value="$t('UI.BtnCancel')"/>
          </div>
          <div v-else class="form-group">
            <input @click="addTask" type="button" class="btn btn-sm btn-primary" :value="$t('UI.BtnSubmit')"/>
            <input type="reset" class="btn btn-sm btn-info" :value="$t('UI.BtnClear')"/>
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
      schedules: [],
      availableSchedules: [],
      editing: -1,
      selected: {
        schedule: {},
        offset: false,
        description: ''
      },
      temp: {}
    }
  },
  watch: {
    '$root.saves' (value) {
      this.tasks = value.tasks || this.tasks
      this.schedules = value.schedules || this.schedules
      this.getAvaliableSchedules()
      if (this.tasks === []) {
        this.$toasted.info(this.$t('TO.ModifyTask.MissDescription'))
      }
    }
  },
  mounted () {
    this.tasks = this.$root.saves.tasks || this.tasks
    this.schedules = this.$root.saves.schedules || this.schedules
    this.getAvaliableSchedules()
    if (this.tasks === []) {
      this.$toasted.info(this.$t('TO.ModifyTask.MissDescription'))
    }
  },
  methods: {
    savesAllTasks () {
      this.$root.saves.tasks = this.tasks
      this.$root.writeToSaves()
    },
    resetSelected () {
      this.selected = {
        schedule: {},
        offset: false,
        description: ''
      }
      this.savesAllTasks()
    },
    getAvaliableSchedules () {
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
      this.availableSchedules = schedule
    },
    taskValidate (task) {
      task = this.selected || task
      if (task.description === '') {
        this.$toasted.error(this.$t('TO.ModifyTask.MissDescription'))
      } else {
        return true
      }
      return false
    },
    addTask () {
      if (this.taskValidate()) {
        this.tasks.push(this.selected)
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
      this.tasks[this.editing] = this.temp
      this.editing = -1
      this.resetSelected()
    },
    removeTask (element) {
      let search = this.tasks.indexOf(element)
      if (search !== -1) {
        this.tasks.splice(search, 1)
        this.savesAllTasks()
      }
    },
    editTask (element, index) {
      this.editing = index
      this.temp = Object.assign({}, element)
      this.selected = element
    }
  }
}
</script>
