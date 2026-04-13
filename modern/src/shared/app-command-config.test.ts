import { describe, expect, it } from 'vitest'
import {
  APP_COMMAND_CONFIG,
  getAppCommandConfig,
  getPrimaryMenuCommands
} from './app-command-config'

describe('app-command-config', () => {
  it('defines metadata for every app command', () => {
    expect(getAppCommandConfig('new-file').accelerator).toBe('CmdOrCtrl+N')
    expect(getAppCommandConfig('open-path').supportsPathname).toBe(true)
    expect(getAppCommandConfig('search').label).toBe('Search')
  })

  it('exposes the primary file-menu command order', () => {
    expect(getPrimaryMenuCommands().map(item => item.command)).toEqual([
      'new-file',
      'open-file',
      'open-folder',
      'save-file',
      'save-file-as'
    ])
  })

  it('keeps command keys aligned with the exported config map', () => {
    expect(Object.keys(APP_COMMAND_CONFIG).sort()).toEqual([
      'new-file',
      'open-file',
      'open-folder',
      'open-path',
      'redo',
      'save-file',
      'save-file-as',
      'search',
      'undo'
    ])
  })
})
