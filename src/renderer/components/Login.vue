<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light">
      <a class="navbar-brand" href="/">YunStudent</a> 
    </nav>
    <div class="container">
      <div class="col-sm-6 offset-sm-3">
        <div class="form-group">
          <label>Account:</label>
          <input v-model="loginData.account" type="text" class="form-control" placeholder="StudentID"/>
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input v-model="loginData.password" type="password" class="form-control" placeholder="Password"/>
        </div>
        <input @click="login" type="submit" class="btn btn-sm btn-primary" value="Submit"/>
        <input @click="clear" type="reset" class="btn btn-sm btn-info" value="Clear"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      loginData: {
        account: '',
        password: ''
      }
    }
  },
  watch: {
    '$root.saves' (value) {
      this.loginData = value.login
      if (this.loginData.account !== '' && this.loginData.password !== '') {
        this.login()
      }
    }
  },
  mounted: function () {
    this.loginData = this.$root.saves.login || this.loginData
    if (this.loginData.account !== '' && this.loginData.password !== '') {
      this.login()
    }
  },
  methods: {
    login: function () {
      let account = this.loginData.account
      let password = this.loginData.password

      if (account.length < 7 || password.length < 4) {
        this.$toasted.show('length not enough')
      } else {
        this.$mainIpc.send('req-login', this.loginData)
      }
    },
    clear: function () {
      this.loginData.account = ''
      this.loginData.password = ''
    }
  }
}
</script>
