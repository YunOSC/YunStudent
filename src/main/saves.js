const fs = require('fs')
const path = require('path')

const savePath = path.join(__static, 'save.data')

class Saves {
  constructor () {
    this.data = {
      'login': {
        'account': '',
        'password': ''
      }
    }
  }

  readSaves () {
    return fs.readFile(savePath, 'utf-8', (err, data) => {
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
      fs.readFile(savePath, 'utf-8', (err, data) => {
        if (err) {
          return this.writeSavesAsync()
        } else {
          this.data = JSON.parse(data)
          return resolve(this)
        }
      })
    })
  }

  writeSaves () {
    fs.writeFile(savePath, JSON.stringify(this.data, null, 4), (err) => {
      if (err !== null) {
        console.log(err)
      }
    })
  }

  writeSavesAsync () {
    return new Promise((resolve, reject) => {
      fs.writeFile(savePath, JSON.stringify(this.data, null, 4), (err) => {
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
