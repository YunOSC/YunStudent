<template>
  <div>
    <modal name="setup" height="auto">
      <div class="container">
        <div class="row col-11" style="padding-top: 3%;">
          <h3>{{ $t('UI.Setup.HdSetup') }}</h3>
        </div>
        <form class="offset-1 form-horizontal">
          <h5>{{ $t('UI.Setup.HdAccount') }}</h5><hr>
          <div class="offset-1 form-group row">
            <div class="row col-12 line">
              <label class="col-5">{{ $t('UI.Setup.Account.LblSaveLoginInfo') }}</label>
              <input v-model="setup.saveingLoginInfo" class="form-contorl col-1" type="checkbox"/>
              <div class="row col-11 offset-1">
                <small>{{ $t('UI.Setup.Account.SmSaveLoginInfoHint') }}</small>
              </div>
            </div>
          </div>
          <h5>{{ $t('UI.Setup.HdUser') }}</h5><hr>
          <div class="offset-1 form-group row">
            <div class="row col-12 line">
              <label class="col-4">{{ $t('UI.Setup.User.LblLanguage') }}</label>
              <select v-model="setup.locale" class="form-control col-7">
                <option value="en_US">English</option>
                <option v-for="(value, key) in allLocales" :key="key" :value="value.locale">{{ value.alias }}</option>
              </select>
            </div>
          </div>
          <h5>{{ $t('UI.Setup.HdCoinHive') }}</h5>
          <div class="offset-1 form-group row">
            <div class="row col-12 line">
              <small>{{ $t('UI.Setup.CoinHive.SmsExplain_L1') }}</small>
              <small>{{ $t('UI.Setup.CoinHive.SmsExplain_L2') }}</small>
              <small>{{ $t('UI.Setup.CoinHive.SmsExplain_L3') }}</small>
            </div>
            <div class="row col-12 line">
              <label class="col-4">{{ $t('UI.Setup.CoinHive.LblEnable') }}</label>
              <input v-model="setup.coinhive.enable" class="form-contorl col-7" type="checkbox"/>
            </div>
            <div class="row col-12 line">
              <label class="col-4">{{ $t('UI.Setup.CoinHive.LblThreads') }}</label>
              <input v-model="setup.coinhive.threads" class="form-control col-7"/>
              <div>
                <small>{{ $t('UI.Setup.CoinHive.SmsThreadsExplain') }}</small>
              </div>
            </div>
            <div class="row col-12 line">
              <label class="col-4">{{ $t('UI.Setup.CoinHive.LblThrottle') }}</label>
              <input v-model="setup.coinhive.throttle" class="form-control col-7"/>
              <div>
                <small>{{ $t('UI.Setup.CoinHive.SmsThrottleExplain') }}</small>
              </div>
            </div>
          </div>
          <div class="form-group">
            <input @click="submit" type="button" class="btn btn-sm btn-primary" :value="$t('UI.BtnSubmit')"/>
            <input @click="reset" type="button" class="btn btn-sm btn-info" :value="$t('UI.Setup.BtnReset')"/>
          </div>
        </form>
      </div>
    </modal>
  </div>
</template>

<script>
const path = require('path')
const fs = require('fs')

export default {
  name: 'setup',
  data () {
    return {
      setup: {
        locale: 'en_US',
        saveingLoginInfo: false,
        coinhive: {
          enable: true,
          threads: 1,
          throttle: 0.9
        }
      },
      allLocales: []
    }
  },
  watch: {
    '$root.saves.setup' (value) {
      this.setup = value
    }
  },
  mounted () {
    this.setup = this.$root.saves.setup
    fs.readdirSync(path.join(__static, 'i18n')).forEach((each) => {
      let json
      try {
        json = JSON.parse(fs.readFileSync(path.join(__static, 'i18n', each)))
        this.allLocales.push({'locale': each.replace('.json', ''), 'alias': json['alias']})
      } catch (err) {
        console.log(err)
      }
    })
  },
  methods: {
    submit () {
      this.$root.saves.setup = this.setup
      this.$root.writeToSaves()
      this.$modal.hide('setup')
    },
    reset () {
      this.setup = this.$root.saves.setup
    }
  }
}
</script>

<style scoped>
  .line {
    padding-top: 2px;
    padding-bottom: 2px;
  }
</style>
