<template>
  <div class="container">
    <h1>{{ $t('UI.Dashboard.HdDashboard') }}</h1>
    <a @click="logout">Logout</a>
    <div class="col-10 offset-1"><work-study/></div>
    <!--div class="col-6"></div-->
  </div>
</template>

<script>
import WorkStudy from '@/components/WorkStudy/WorkStudy'

export default {
  name: 'dashboard',
  components: { WorkStudy },
  methods: {
    logout: function () {}
  }
}
</script>
