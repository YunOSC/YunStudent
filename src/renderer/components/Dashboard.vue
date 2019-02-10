<template>
  <div class="container">
    <h1>{{ $t('UI.Dashboard.HdDashboard') }}</h1>
    <a @click="$modal.show('setup')" class="btn btn-sm">Setup</a>
    <a @click="logout" type="button" class="btn btn-sm">Logout</a>
    <div class="col-10 offset-1">
      <setup/>
      <work-study/>
    </div>
    <!--div class="col-6"></div-->
  </div>
</template>

<script>
import Setup from '@/components/Setup'
import WorkStudy from '@/components/WorkStudy/WorkStudy'

export default {
  name: 'dashboard',
  components: { Setup, WorkStudy },
  methods: {
    logout: function () {
      this.$mainIpc.send('req-logout')
      this.$root.clearSaves()
      this.$router.push({'name': 'login'})
    }
  }
}
</script>
