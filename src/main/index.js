'use strict'

import { app, BrowserWindow } from 'electron'
import { default as Crawler } from './crawler'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function killAllChrome () {
  let find = require('find-process')
  return find('name', 'chrome').then((list) => {
    return new Promise((resolve) => {
      list.forEach((each, index, array) => {
        if (Crawler.browserArgs.every(elem => each.cmd.split(' ').indexOf(elem) > -1)) {
          process.kill(each.pid)
        }
        if (index === array.length - 1) {
          return resolve(true)
        }
      })
    })
  })
}

function killAllChromeDriver () {
  let find = require('find-process')
  return find('name', 'chromedriver').then((list) => {
    return new Promise((resolve) => {
      list.forEach((each, index, array) => {
        process.kill(each.pid)
        if (index === array.length - 1) {
          return resolve(true)
        }
      })
    })
  })
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  /* mainWindow.on('closed', () => {
    mainWindow = null
  }) */
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    killAllChromeDriver().then(() => {
      console.log('ChromeDriver cleaned.')
      return killAllChrome()
    }).then(() => {
      console.log('Chrome cleaned.')
      app.quit()
    })
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
