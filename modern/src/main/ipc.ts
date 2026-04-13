import { ipcMain } from 'electron'
import { registerCloseCoordinator } from './close-manager'
import { createAppIpcHandlers } from './app-handlers'
import { createFileIpcHandlers } from './file-handlers'
import { createSettingsIpcHandlers } from './settings-handlers'
import { createWindowIpcHandlers } from './window-handlers'
import { registerIpcHandleMap } from './ipc-registration-support'

const handlerFactories = [
  createAppIpcHandlers,
  createFileIpcHandlers,
  createSettingsIpcHandlers,
  createWindowIpcHandlers
]

let ipcHandlersRegistered = false

export const registerIpcHandlers = () => {
  if (ipcHandlersRegistered) {
    return
  }

  ipcHandlersRegistered = true
  registerCloseCoordinator()

  const handle = ipcMain.handle.bind(ipcMain)
  for (const factory of handlerFactories) {
    registerIpcHandleMap(handle, factory())
  }
}
