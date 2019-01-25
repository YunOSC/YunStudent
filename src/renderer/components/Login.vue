<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light">
      <a class="navbar-brand" href="/">YunStudent</a> 
    </nav>
    <div class="container">
      <div class="col-sm-6 offset-sm-3">
        <form>
          <div class="form-group">
            <label>Account:</label>
            <input v-model="loginData.account" type="text" class="form-control" placeholder="StudentID" required/>
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input v-model="loginData.password" type="password" class="form-control" placeholder="Password" required/>
          </div>
          <button @click="login" type="button" class="btn btn-sm btn-primary">Submit</button>
          <button type="reset" class="btn btn-sm btn-info">Clear</button>
        </form>
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
      if (value.login.account !== undefined && value.login.password !== undefined) {
        this.loginData = value.login
        this.login()
      }
    }
  },
  mounted: function () {
    this.loginData = this.$root.saves.login || this.loginData
    this.login()
  },
  methods: {
    login: function () {
      let account = this.loginData.account
      let password = this.loginData.password

      if (account !== '' && password !== '') {
        if (account.length < 7 || password.length < 4) {
          this.$toasted.show('length not enough')
        } else {
          this.$mainIpc.send('req-login', this.loginData)
        }
      }
    }
  }
}
</script>
