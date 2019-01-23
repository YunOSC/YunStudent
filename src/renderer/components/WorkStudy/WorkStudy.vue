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
    addWorkDiary: function () {
      this.$crawler.visit('https://webapp.yuntech.edu.tw/workstudy/StudWorkRecord/Create').catch((err) => {
        if (err.name.includes('UnexpectedAlertOpenError')) {
          return this.$crawler.driver.switchTo().alert().then((alert) => {
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
  }
}
</script>

<style scope>
  .tb-font-14 {
    font-size: 14px;
  }
</style>
