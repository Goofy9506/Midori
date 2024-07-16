import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { STORE } from '../renderer/src/types/Storage'

let mainWindow: BrowserWindow | null = null
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    frame: process.platform === 'darwin',
    titleBarStyle: 'hidden',
    alwaysOnTop: false,
    icon: icon,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: false
    }
  })

  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('getStore', () => {
  const value = STORE.store
  console.log('Store Got State', JSON.stringify(value))
  return value
})

ipcMain.handle('getStoreValue', (_, key) => {
  const value = STORE.get(key)
  console.log('Store Got', key, value)
  return value
})

ipcMain.handle('setStoreValue', (_, key, value) => {
  console.log('Store Set', key, value)
  return STORE.set(key, value)
})

ipcMain.handle('deleteStoreValue', (_, key) => {
  STORE.delete(key)
  if (mainWindow) mainWindow.reload()
})

ipcMain.on('minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('maximize', () =>
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
)

ipcMain.on('exit', () => {
  mainWindow?.close()
})

ipcMain.on('reload', () => {
  mainWindow?.reload()
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('midori', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('midori')
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
