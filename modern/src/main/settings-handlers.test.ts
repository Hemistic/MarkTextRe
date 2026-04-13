import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { SettingsPatch, SettingsState } from '@shared/contracts'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MAIN_IPC_CHANNELS } from './ipc-contract'

vi.mock('./settings-storage', () => ({
  readSettingsState: vi.fn(),
  writeSettingsPatch: vi.fn()
}))

vi.mock('./dialogs', () => ({
  showOpenDirectoryDialog: vi.fn()
}))

vi.mock('./webcontents', () => ({
  getSenderWindow: vi.fn()
}))

vi.mock('./window-settings', () => ({
  applyWindowSettings: vi.fn()
}))

import { createSettingsIpcHandlers } from './settings-handlers'
import { readSettingsState, writeSettingsPatch } from './settings-storage'
import { showOpenDirectoryDialog } from './dialogs'
import { getSenderWindow } from './webcontents'
import { applyWindowSettings } from './window-settings'

const readSettingsStateMock = vi.mocked(readSettingsState)
const writeSettingsPatchMock = vi.mocked(writeSettingsPatch)
const showOpenDirectoryDialogMock = vi.mocked(showOpenDirectoryDialog)
const getSenderWindowMock = vi.mocked(getSenderWindow)
const applyWindowSettingsMock = vi.mocked(applyWindowSettings)

describe('settings handlers', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns the stored state', async () => {
    const stubState = { zoom: 1 } as unknown as SettingsState
    readSettingsStateMock.mockResolvedValueOnce(stubState)

    const handlers = createSettingsIpcHandlers()
    const getStateHandler = handlers[MAIN_IPC_CHANNELS.settings.getState] as () => Promise<SettingsState>
    await expect(getStateHandler()).resolves.toBe(stubState)
    expect(readSettingsStateMock).toHaveBeenCalledTimes(1)
  })

  it('writes patches and updates the window runtime state', async () => {
    const zoom = 1.5
    const stubState = { zoom } as unknown as SettingsState
    writeSettingsPatchMock.mockResolvedValueOnce(stubState)

    const fakeWindow = {} as unknown as BrowserWindow

    getSenderWindowMock.mockReturnValue(fakeWindow)
    const handlers = createSettingsIpcHandlers()
    const updateStateHandler = handlers[MAIN_IPC_CHANNELS.settings.updateState] as (
      event: IpcMainInvokeEvent,
      patch: SettingsPatch
    ) => Promise<SettingsState>

    const event = { sender: {} } as IpcMainInvokeEvent
    await expect(updateStateHandler(event, { zoom })).resolves.toBe(stubState)

    expect(writeSettingsPatchMock).toHaveBeenCalledWith({ zoom })
    expect(applyWindowSettingsMock).toHaveBeenCalledWith(fakeWindow, stubState)
  })

  it('picks directories through the dialog', async () => {
    showOpenDirectoryDialogMock.mockResolvedValueOnce('C:/images')
    const handlers = createSettingsIpcHandlers()
    const pickPathHandler = handlers[MAIN_IPC_CHANNELS.settings.pickPath] as (
      event: IpcMainInvokeEvent,
      kind: 'default-directory' | 'image-folder',
      currentPath?: string | null
    ) => Promise<string | null>

    await expect(
      pickPathHandler(null as any, 'default-directory', 'C:/current')
    ).resolves.toBe('C:/images')

    expect(showOpenDirectoryDialogMock).toHaveBeenCalledWith('C:/current')
  })
})
