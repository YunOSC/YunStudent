<template>
  <div>
    <h5>WorkStudy</h5>
    <info-summary/>
    <div>
      <modify-task/>
    </div>
  </div>
</template>

<script>
import InfoSummary from './InfoSummary'
import ModifyTask from './ModifyTask'

export default {
  name: 'workd-study',
  components: { InfoSummary, ModifyTask },
  methods: {
    addWorkDiary: function () {}
  }
}
</script>

<style scope>
  .tb-font-14 {
    font-size: 14px;
  }
</style>
