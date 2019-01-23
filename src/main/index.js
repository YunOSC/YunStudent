'use strict'

import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } from 'electron'
import { default as Crawler } from './crawler'
import { default as Saves } from './saves'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let tray
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const saves = new Saves()

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

  mainWindow.on('minimize', () => {
    mainWindow.hide()
  })

  /* mainWindow.on('closed', () => {
    mainWindow = null
  }) */

  createTray()
  saves.readSavesAsync()
}

ipcMain.on('renderer-created', (event, data) => {
  mainWindow.webContents.send('send-saves', saves.data)
})

ipcMain.on('renderer-req-write-saves', (event, data) => {
  saves.data = data
  saves.writeSaves()
  mainWindow.webContents.send('update-saves', saves.data)
})

function createTray () {
  const iconPath = require('path').join(__dirname, '../../static/icons/icon.ico')
  const img = nativeImage.createFromPath(iconPath)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'YunStudent',
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
  tray.setToolTip('YunStudent')
  tray.setContextMenu(contextMenu)
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
