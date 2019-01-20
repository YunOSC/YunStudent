import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import Crawler from '../main/crawler'

import Toasted from 'vue-toasted'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'

Vue.use(Toasted)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.ssoValidateServer = Vue.prototype.$ssoValidateServer = 'http://sso-validate.clo5de.info:5000'
Vue.http = Vue.prototype.$http = axios
Vue.crawler = Vue.prototype.$crawler = new Crawler(Vue.ssoValidateServer, '')
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
