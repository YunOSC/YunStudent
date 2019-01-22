import Vue from 'vue'
import App from './App'
import router from './router'

import store from './store'
import axios from 'axios'
import Crawler from '../main/crawler'
import Saves from '../main/saves'

import Toasted from 'vue-toasted'
import VModal from 'vue-js-modal'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'

import Navigator from '@/components/Navigator'

Vue.use(Toasted, {
  duration: 2000,
  theme: 'bubble',
  iconPack: 'fontawesome'
})

Vue.use(VModal)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.ssoValidateServer = Vue.prototype.$ssoValidateServer = 'http://sso-validate.clo5de.info:5000'
Vue.http = Vue.prototype.$http = axios
Vue.crawler = Vue.prototype.$crawler = new Crawler(Vue.ssoValidateServer, {})
Vue.saves = Vue.prototype.$saves = new Saves()
Vue.config.productionTip = false

Vue.initCrawler = Vue.prototype.$initCrawler = function () {
  return this.$saves.readSavesAsync().then((saves) => {
    let loginData = saves.data.login
    return this.$crawler.initDriver(loginData.account, loginData.password)
  })
}

Vue.component('navigator', Navigator)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
  beforeCreate: function () {
    this.$initCrawler()
  }
}).$mount('#app')
