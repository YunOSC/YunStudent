'use strict'

import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } from 'electron'
import I18n from '../i18n/index'
import Crawler from './crawler/index'
import Saves from './saves'
import MainIpc from '../ipc/main'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, tray, mainIpc
const i18n = new I18n()
const notifier = require('node-notifier')

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const ssoValidateServer = 'http://sso-validate.clo5de.info:5000'
const saves = new Saves(require('path').join(__static, '/save.data'))
const crawler = new Crawler(ssoValidateServer, {})

function killAllChrome () {
  let find = require('find-process')
  return find('name', 'chrome').then((list) => {
    return new Promise((resolve) => {
      list.forEach((each, index, array) => {
        if (crawler.browserArgs.every(elem => each.cmd.split(' ').indexOf(elem) > -1)) {
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

  mainWindow.on('minimize', () => {
    mainWindow.hide()
  })

  /* mainWindow.on('closed', () => {
    mainWindow = null
  }) */

  createTray()
  saves.readSavesAsync().then((result) => {
    console.log('Saves init status: ' + result)
    return crawler.initDriver(saves.data.login.account, saves.data.login.password)
  }).then((result) => {
    console.log('Crawler init status: ' + result)
    return i18n.loadLocaleAsync(saves.data.setup.locale, __static)
  }).then((result) => {
    console.log('Language init in Locale:' + result.locale + ', Path: ' + result.localePath)
    mainIpc = new MainIpc(i18n, ipcMain, sendNotify, mainWindow, saves, crawler)
    console.log('MainIPC init status: ' + (mainIpc !== undefined))
  }).catch((err) => {
    console.log(err)
    app.quit()
  })
}

function createTray () {
  const iconPath = require('path').join(__static, '/icons/icon.ico')
  const img = nativeImage.createFromPath(iconPath)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'YunWorker',
      click () {
        mainWindow.show()
      }
    },
    {
      label: 'Quit',
      click () {
        mainWindow.removeAllListeners('close')
        mainWindow.close()
      }
    }
  ])

  tray = new Tray(img)
  tray.setToolTip('YunWorker')
  tray.setContextMenu(contextMenu)
}

function sendNotify (message, sound, title) {
  notifier.notify({
    title: title || 'YunWorker',
    message: message,
    icon: require('path').join(__static, '/icons/icon.ico'),
    sound: sound || true
  })
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
