import { BrowserWindow } from 'electron'
import type { AppCommand, AppCommandMessage } from '@shared/contracts'
import { MAIN_IPC_CHANNELS } from './ipc-contract'

type WindowResolver = () => BrowserWindow | null

const resolveDefaultTargetWindow = () => {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null
}

export const dispatchRendererCommand = (
  message: AppCommandMessage,
  resolveTargetWindow: WindowResolver = resolveDefaultTargetWindow
) => {
  const targetWindow = resolveTargetWindow()
  if (!targetWindow || targetWindow.isDestroyed()) {
    return false
  }

  targetWindow.webContents.send(MAIN_IPC_CHANNELS.app.command, message)
  return true
}

export const createLegacyMainCommandAdapter = (
  dispatchCommand = dispatchRendererCommand
) => {
  const dispatchAppCommand = (command: AppCommand) => {
    dispatchCommand({ command })
  }

  const dispatchOpenPath = (pathname: string, targetWindow?: BrowserWindow) => {
    dispatchCommand(
      {
        command: 'open-path',
        pathname
      },
      () => targetWindow ?? resolveDefaultTargetWindow()
    )
  }

  const dispatchOpenFolder = (pathname: string, targetWindow?: BrowserWindow) => {
    dispatchCommand(
      {
        command: 'open-folder',
        pathname
      },
      () => targetWindow ?? resolveDefaultTargetWindow()
    )
  }

  return {
    dispatchAppCommand,
    dispatchOpenFolder,
    dispatchOpenPath
  }
}

// Shared singleton seam for modern main services that need to send renderer commands.
export const legacyMainCommandAdapter = createLegacyMainCommandAdapter()
