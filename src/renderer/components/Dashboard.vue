<template>
  <div class="container">
    <h1>Dashboard</h1>
    <a @click="logout">Logout</a>
    <div class="col-6"><work-study/></div>
    <div class="col-6"></div>
  </div>
</template>

<script>
import WorkStudy from '@/components/WorkStudy/WorkStudy'

export default {
  name: 'dashboard',
  components: { WorkStudy },
  mounted: function () {
    this.$crawler.ssoVisit('https://webapp.yuntech.edu.tw/YunTechSSO/')
  },
  methods: {
    logout: function () {
      this.$root.writeToSaves()
      this.$router.push({'name': 'login'})
    }
  }
}
</script>
