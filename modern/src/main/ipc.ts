import { registerAppIpcHandlers } from './app-handlers'
import { registerCloseCoordinator } from './close-manager'
import { registerFileIpcHandlers } from './file-handlers'
import { registerWindowIpcHandlers } from './window-handlers'

let ipcHandlersRegistered = false

export const registerIpcHandlers = () => {
  if (ipcHandlersRegistered) {
    return
  }

  ipcHandlersRegistered = true
  registerCloseCoordinator()
  registerAppIpcHandlers()
  registerFileIpcHandlers()
  registerWindowIpcHandlers()
}
