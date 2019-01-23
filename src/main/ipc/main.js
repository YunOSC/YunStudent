class MainIpc {
  constructor (ipc, window, saves) {
    this.ipc = ipc
    this.window = window
    this.saves = saves

    this.ipc.on('renderer-created', rendererCreated)
    this.ipc.on('renderer-req-write-saves', reqWriteSaves)
  }

  rendererCreated (event, data) {
    this.window.webContents.send('send-saves', this.saves.data)
  }

  reqWriteSaves (event, data) {
    this.saves.data = data
    this.saves.writeSaves()
    this.window.webContents.send('update-saves', this.saves.data)
  }
}

export default MainIpc
