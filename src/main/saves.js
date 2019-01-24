const fs = require('fs')

class Saves {
  constructor (savePath) {
    this.savePath = savePath
    this.data = {
      'login': {
        'account': '',
        'password': ''
      }
    }
  }

  readSaves () {
    return fs.readFile(this.savePath, 'utf-8', (err, data) => {
      if (err) {
        this.writeSaves()
      } else {
        this.data = JSON.parse(data)
        return this.data
      }
    })
  }

  readSavesAsync () {
    return new Promise((resolve) => {
      fs.readFile(this.savePath, 'utf-8', (err, data) => {
        if (err) {
          return this.writeSavesAsync()
        } else {
          this.data = JSON.parse(data)
          return resolve(true)
        }
      })
    })
  }

  writeSaves () {
    fs.writeFile(this.savePath, JSON.stringify(this.data, null, 4), (err) => {
      if (err !== null) {
        console.log(err)
      }
    })
  }

  writeSavesAsync () {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.savePath, JSON.stringify(this.data, null, 4), (err) => {
        if (err !== null) {
          return reject(err)
        } else {
          return resolve()
        }
      })
    })
  }
}

export default Saves
