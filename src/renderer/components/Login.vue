<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light">
      <a class="navbar-brand" href="/">YunWorker</a> 
    </nav>
    <div class="container">
      <div class="col-sm-6 offset-sm-3">
        <form>
          <div class="form-group">
            <label>{{ $t('UI.Login.LblAccount') }}:</label>
            <input v-model="loginData.account" :disabled="logining" type="text" class="form-control" :placeholder="$t('UI.Login.LblStudentID')" required/>
          </div>
          <div class="form-group">
            <label>{{ $t('UI.Login.LblPassword') }}:</label>
            <input v-model="loginData.password" :disabled="logining" type="password" class="form-control" :placeholder="$t('UI.Login.LblPassword')" required/>
          </div>
          <button @click="login" :disabled="logining" type="button" class="btn btn-sm btn-primary">{{ logining ? $t('UI.Login.BtnLogining') : $t('UI.BtnSubmit') }}</button>
          <button :disabled="logining" type="reset" class="btn btn-sm btn-info">{{ $t('UI.BtnClear') }}</button>
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
      logining: false,
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
    this.$root.$on('loginReset', () => {
      this.logining = false
    })
    this.loginData = this.$root.saves.login || this.loginData
    this.login()
  },
  methods: {
    login: function () {
      let account = this.loginData.account
      let password = this.loginData.password

      if (account !== '' && password !== '') {
        if (account.length < 7 || password.length < 4) {
          this.$toasted.show(this.$t('TO.Login.LengthNotEnough'))
        } else {
          this.logining = true
          this.$mainIpc.send('req-login', this.loginData)
        }
      }
    }
  }
}
</script>
