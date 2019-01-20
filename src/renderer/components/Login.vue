<template>
  <div>
    <div>
      <label>Account:</label>
      <input v-model="account" type="text" class="form-control"/>
    </div>
    <div>
      <label>Password:</label>
      <input v-model="password" type="password" class="form-control"/>
    </div>
    <input @click="login(account, password)" type="submit"  class="btn btn-primary"/>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'login',
  data: () => {
    return {
      account: '',
      password: ''
    }
  },
  methods: {
    login: (account, password) => {
      if (account.length < 7 || password.length < 4) {
        Vue.prototype.$toasted.show('length not enough')
      } else {
        Vue.prototype.$crawler.ssoLogin(account, password).then((result) => {
          console.log(result)
        })
      }
    }
  }
}
</script>
