import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import Crawler from '../main/crawler'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.crawler = Vue.prototype.$crawler = new Crawler('', '111', '222')
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  beforeCreate: () => {
    console.log('test')
    Vue.prototype.$crawler.ssoIndex()
    console.log(Vue.prototype.$crawler.ssoSource())
    // console.log(this.$crawler)
  },
  template: '<App/>'
}).$mount('#app')
