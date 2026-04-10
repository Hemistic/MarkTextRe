import { contextBridge, ipcRenderer } from 'electron'
import type { MarkTextApi } from '@shared/contracts'
import { IPC_CHANNELS } from '@shared/ipc'

const api: MarkTextApi = {
  app: {
    getBootstrap: () => ipcRenderer.invoke(IPC_CHANNELS.app.getBootstrap)
  },
  files: {
    openMarkdown: () => ipcRenderer.invoke(IPC_CHANNELS.files.openMarkdown),
    openMarkdownAtPath: pathname => ipcRenderer.invoke(IPC_CHANNELS.files.openMarkdownAtPath, pathname),
    saveMarkdown: input => ipcRenderer.invoke(IPC_CHANNELS.files.saveMarkdown, input)
  },
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.window.minimize),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.window.maximize),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.window.close)
  }
}

contextBridge.exposeInMainWorld('marktext', api)
