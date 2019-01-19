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
  created: () => {
    console.log('test')

    Vue.prototype.$crawler.ssoIndex().then(() => {
      return Vue.prototype.$crawler.ssoSource()
    }).then((src) => {
      console.log(src)
      return Vue.prototype.$crawler.quit()
    })
    // Vue.prototype.$crawler.close()
    // Vue.prototype.$crawler.quit()
    // console.log(this.$crawler)
  },
  template: '<App/>'
}).$mount('#app')
