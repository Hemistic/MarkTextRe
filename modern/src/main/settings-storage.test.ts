import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import path from 'node:path'
import os from 'node:os'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'

const baseDir = path.join(os.tmpdir(), 'marktext-modern-settings-test', randomUUID())
const userDataPath = path.join(baseDir, 'user-data')
const appDataPath = path.join(baseDir, 'app-data')

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => (name === 'appData' ? appDataPath : userDataPath)
  }
}))

import { readSettingsState, writeSettingsPatch } from './settings-storage'
import { settingsStatePath } from './paths'

const removeStateDir = () => fs.rm(baseDir, { recursive: true, force: true })

describe('settings storage', () => {
  beforeEach(async () => {
    await removeStateDir()
  })

  afterAll(async () => {
    await removeStateDir()
  })

  it('creates default state when missing', async () => {
    const state = await readSettingsState()
    expect(state.zoom).toBe(1)

    const persisted = JSON.parse(await fs.readFile(settingsStatePath(), 'utf8'))
    expect(persisted.language).toBe('en')
  })

  it('sanitizes patched values', async () => {
    await readSettingsState()
    const patched = await writeSettingsPatch({ zoom: 99, fontSize: 99 })

    expect(patched.zoom).toBe(1)
    expect(patched.fontSize).toBe(16)

    const persisted = JSON.parse(await fs.readFile(settingsStatePath(), 'utf8'))
    expect(persisted.zoom).toBe(1)
  })

  it('migrates legacy preferences', async () => {
    const legacyDir = path.join(appDataPath, 'marktext')
    await fs.mkdir(legacyDir, { recursive: true })
    await fs.writeFile(path.join(legacyDir, 'preferences.json'), JSON.stringify({ fontSize: 18 }), 'utf8')
    await fs.writeFile(
      path.join(legacyDir, 'dataCenter.json'),
      JSON.stringify({ imageFolderPath: 'C:/images' }),
      'utf8'
    )

    const state = await readSettingsState()
    expect(state.fontSize).toBe(18)
    expect(state.imageFolderPath).toBe('C:/images')
  })
})
