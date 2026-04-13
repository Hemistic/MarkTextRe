import type { IpcMainInvokeEvent } from 'electron'
import type {
  SettingsPatch,
  SettingsPathPickerKind
} from '@shared/contracts'
import { MAIN_IPC_CHANNELS } from './ipc-contract'
import { showOpenDirectoryDialog } from './dialogs'
import { readSettingsState, writeSettingsPatch } from './settings-storage'
import { getSenderWindow } from './webcontents'
import { applyWindowSettings } from './window-settings'

const applyWindowState = (event: IpcMainInvokeEvent, settings: Awaited<ReturnType<typeof readSettingsState>>) => {
  const window = getSenderWindow(event.sender)
  if (!window) {
    return
  }

  applyWindowSettings(window, settings)
}

const resolveDirectoryDefaultPath = (kind: SettingsPathPickerKind, currentPath?: string | null) => {
  if (currentPath) {
    return currentPath
  }

  if (kind === 'image-folder') {
    return undefined
  }

  return undefined
}

export const createSettingsIpcHandlers = () => ({
  [MAIN_IPC_CHANNELS.settings.getState]: async () => readSettingsState(),
  [MAIN_IPC_CHANNELS.settings.updateState]: async (
    event: IpcMainInvokeEvent,
    patch: SettingsPatch
  ) => {
    const nextState = await writeSettingsPatch(patch)
    applyWindowState(event, nextState)
    return nextState
  },
  [MAIN_IPC_CHANNELS.settings.pickPath]: async (
    _event: IpcMainInvokeEvent,
    kind: SettingsPathPickerKind,
    currentPath?: string | null
  ) => {
    return showOpenDirectoryDialog(resolveDirectoryDefaultPath(kind, currentPath))
  }
})
