import Vue from 'vue'
import App from './App'
import router from './router'

import store from './store'
import axios from 'axios'
import { ipcRenderer } from 'electron'
import {
  sendSaves, updateSaves, resLogin, resLogout, resNavigateUrl,
  resCrawlAvailableContracts, resCrawlYearSchedules } from '../main/ipc/renderer'

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
Vue.http = Vue.prototype.$http = axios
Vue.mainIpc = Vue.prototype.$mainIpc = ipcRenderer
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
      this.$mainIpc.send('req-write-saves', this.saves)
    }
  },
  template: '<App/>',
  created: function () {
    this.$mainIpc.send('renderer-created')
  }
}).$mount('#app')

Vue.mainIpc.on('send-saves', (event, data) => sendSaves(vue, event, data))
Vue.mainIpc.on('update-saves', (event, data) => updateSaves(vue, event, data))
Vue.mainIpc.on('res-login', (event, data) => resLogin(vue, event, data))
Vue.mainIpc.on('res-logout', (event, data) => resLogout(vue, event, data))
Vue.mainIpc.on('res-navigate-url', (event, data) => resNavigateUrl(vue, event, data))
Vue.mainIpc.on('res-crawl-available-contracts', (event, data) => resCrawlAvailableContracts(vue, event, data))
Vue.mainIpc.on('res-crawl-year-schedules', (event, data) => resCrawlYearSchedules(vue, event, data))
