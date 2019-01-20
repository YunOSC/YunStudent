<template>
  <div>
    <div>
      <label>Account:</label>
      <input v-model="loginData.account" type="text" class="form-control" placehoder="StudentID"/>
    </div>
    <div>
      <label>Password:</label>
      <input v-model="loginData.password" type="password" class="form-control"/>
    </div>
    <input @click="login()" type="submit"  class="btn btn-primary" placehoder="Password"/>
  </div>
</template>

<script>
import router from '../router'

export default {
  name: 'login',
  data: () => {
    return {
      loginData: {
        account: '',
        password: ''
      }
    }
  },
  created: function () {
    this.$saves.readSavesAsync().then((saves) => {
      this.loginData = saves.data.login
      if (this.loginData.account !== '' && this.loginData.password !== '') {
        this.login()
      }
    })
  },
  methods: {
    login: function () {
      let account = this.loginData.account
      let password = this.loginData.password

      if (account.length < 7 || password.length < 4) {
        this.$toasted.show('length not enough')
      } else {
        this.$crawler.ssoLogin(account, password).then((result) => {
          if (result) {
            this.$saves.data.login = this.loginData
            this.$saves.writeSaves()
            router.push({'name': 'dashboard'})
          } else {
            this.$toasted.show('Login failed')
          }
        })
      }
    }
  }
}
</script>
