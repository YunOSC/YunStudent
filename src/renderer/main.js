import Vue from 'vue'
import App from './App'
import router from './router'

import store from './store'
import axios from 'axios'
import Crawler from '../main/crawler/index'
import { ipcRenderer } from 'electron'

import Toasted from 'vue-toasted'
import VModal from 'vue-js-modal'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'

import Navigator from '@/components/Navigator'

Vue.use(Toasted, {
  duration: 8000,
  theme: 'bubble',
  iconPack: 'fontawesome'
})

Vue.use(VModal)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.ssoValidateServer = Vue.prototype.$ssoValidateServer = 'http://sso-validate.clo5de.info:5000'
Vue.http = Vue.prototype.$http = axios
Vue.mainIpc = Vue.prototype.$mainIpc = ipcRenderer
Vue.crawler = Vue.prototype.$crawler = new Crawler(Vue.ssoValidateServer, {})
Vue.config.productionTip = false

Vue.component('navigator', Navigator)

/* eslint-disable no-new */
const vue = new Vue({
  components: { App },
  router,
  store,
  data () {
    return {
      saves: {}
    }
  },
  methods: {
    writeToSaves () {
      this.$mainIpc.send('renderer-req-write-saves', this.saves)
    }
  },
  template: '<App/>',
  created: function () {
    this.$mainIpc.send('renderer-created')
  }
}).$mount('#app')

Vue.mainIpc.on('send-saves', (event, data) => {
  vue.$data.saves = data
  let loginData = vue.$data.saves.login
  vue.$crawler.initDriver(loginData.account, loginData.password)
})

Vue.mainIpc.on('update-saves', (event, data) => {
  vue.$data.saves = data
})
