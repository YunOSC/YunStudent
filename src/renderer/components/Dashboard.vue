<template>
  <div>
    <h1>Dashboard</h1>
    <router-link to="work-study">WorkStudy</router-link>
    <a @click="logout">Logout</a>
  </div>
</template>

<script>
export default {
  name: 'dashboard',
  mounted: function () {
    this.$crawler.visit('https://webapp.yuntech.edu.tw/YunTechSSO/')
  },
  methods: {
    logout: function () {
      this.$saves.writeSaves()
      this.$router.push({'name': 'login'})
    }
  }
}
</script>
