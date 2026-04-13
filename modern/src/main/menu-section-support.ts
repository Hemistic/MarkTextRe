import type { AppCommand } from '@shared/contracts'

type MenuItem = Electron.MenuItemConstructorOptions

export const createFileSubmenu = (
  recentFilesSubmenu: MenuItem[],
  isMac: boolean,
  createAppCommandMenuItem: (
    command: AppCommand,
    dispatchCommand: (command: AppCommand) => void
  ) => MenuItem,
  dispatchAppCommand: (command: AppCommand) => void
): MenuItem[] => {
  return [
    createAppCommandMenuItem('new-file', dispatchAppCommand),
    createAppCommandMenuItem('open-file', dispatchAppCommand),
    {
      label: 'Open Recent',
      submenu: recentFilesSubmenu
    },
    { type: 'separator' as const },
    createAppCommandMenuItem('save-file', dispatchAppCommand),
    createAppCommandMenuItem('save-file-as', dispatchAppCommand),
    { type: 'separator' as const },
    isMac ? { role: 'close' as const } : { role: 'quit' as const }
  ]
}

export const createEditSubmenu = (
  createAppCommandMenuItem: (
    command: AppCommand,
    dispatchCommand: (command: AppCommand) => void
  ) => MenuItem,
  dispatchAppCommand: (command: AppCommand) => void
): MenuItem[] => {
  return [
    createAppCommandMenuItem('undo', dispatchAppCommand),
    createAppCommandMenuItem('redo', dispatchAppCommand),
    { type: 'separator' as const },
    createAppCommandMenuItem('search', dispatchAppCommand),
    { type: 'separator' as const },
    { role: 'cut' as const },
    { role: 'copy' as const },
    { role: 'paste' as const },
    { role: 'delete' as const },
    { type: 'separator' as const },
    { role: 'selectAll' as const }
  ]
}
