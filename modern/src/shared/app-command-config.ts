import type { AppCommand } from './contracts'

export interface AppCommandConfig {
  command: AppCommand
  label: string
  accelerator: string | null
  supportsPathname?: boolean
}

export const APP_COMMAND_CONFIG: Record<AppCommand, AppCommandConfig> = {
  'new-file': {
    command: 'new-file',
    label: 'New File',
    accelerator: 'CmdOrCtrl+N'
  },
  'open-file': {
    command: 'open-file',
    label: 'Open...',
    accelerator: 'CmdOrCtrl+O'
  },
  'open-folder': {
    command: 'open-folder',
    label: 'Open Folder...',
    accelerator: 'Shift+CmdOrCtrl+O'
  },
  'open-path': {
    command: 'open-path',
    label: 'Open Path',
    accelerator: null,
    supportsPathname: true
  },
  'save-file': {
    command: 'save-file',
    label: 'Save',
    accelerator: 'CmdOrCtrl+S'
  },
  'save-file-as': {
    command: 'save-file-as',
    label: 'Save As...',
    accelerator: 'Shift+CmdOrCtrl+S'
  },
  undo: {
    command: 'undo',
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z'
  },
  redo: {
    command: 'redo',
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z'
  },
  search: {
    command: 'search',
    label: 'Search',
    accelerator: 'CmdOrCtrl+F'
  }
}

export const getAppCommandConfig = (command: AppCommand) => APP_COMMAND_CONFIG[command]

export const getPrimaryMenuCommands = () => ([
  APP_COMMAND_CONFIG['new-file'],
  APP_COMMAND_CONFIG['open-file'],
  APP_COMMAND_CONFIG['open-folder'],
  APP_COMMAND_CONFIG['save-file'],
  APP_COMMAND_CONFIG['save-file-as']
])
