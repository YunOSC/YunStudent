import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: require('@/components/Login').default
      // name: 'landing-page',
      // component: require('@/components/LandingPage').default
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: require('@/components/Dashboard').default
    },
    {
      path: '/work-study',
      name: 'work-study',
      component: require('@/components/WorkStudy').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
