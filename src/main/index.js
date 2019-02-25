'use strict'

import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } from 'electron'
import I18n from '../i18n/index'
import Crawler from './crawler/index'
import Saves from './saves'
import Miner from './miner'
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
const yunWorkerUserDataPath = app.getPath('userData')

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const ssoValidateServer = 'http://sso-validate.clo5de.info:5000'
const saves = new Saves(require('path').join(yunWorkerUserDataPath, 'save.data'))
const crawler = new Crawler(ssoValidateServer, {})
const miner = new Miner()

function quitApp () {
  miner.stop().then(() => {
    console.log('Miner stoped.')
    return crawler.close()
  }).then(() => {
    app.quit()
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

  createTray().then(() => {
    return saves.readSavesAsync()
  }).then((result) => {
    console.log('Saves init status: ' + result + ', Path: ' + saves.savePath)
    return crawler.init(saves.data.login.account, saves.data.login.password)
  }).then((result) => {
    console.log('Crawler init status: ' + result)
    return miner.start()
  }).then((result) => {
    console.log('Miner is disable, setup: ' + JSON.stringify(result.coinhive, null, 4))
    return i18n.loadLocaleAsync(saves.data.setup.locale, __static)
  }).then((result) => {
    console.log('Language init in Locale:' + result.locale + ', Path: ' + result.localePath)
    mainIpc = new MainIpc(i18n, ipcMain, sendNotify, mainWindow, saves, crawler, miner)
    console.log('MainIPC init status: ' + (mainIpc !== undefined))
  }).catch((err) => {
    console.log(err)
    quitApp()
  })
}

function createTray () {
  return new Promise((resolve, reject) => {
    try {
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
      return resolve(true)
    } catch (err) {
      return reject(err)
    }
  })
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
    quitApp()
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
