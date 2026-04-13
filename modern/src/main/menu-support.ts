import { getAppCommandConfig } from '@shared/app-command-config'
import type { AppCommand, RecentDocument } from '@shared/contracts'
import { createEditSubmenu, createFileSubmenu } from './menu-section-support'

type MenuItem = Electron.MenuItemConstructorOptions

export const createCommandMenuItem = (
  label: string,
  accelerator: string | null,
  onSelect: () => void
): MenuItem => ({
  label,
  ...(accelerator ? { accelerator } : {}),
  click: onSelect
})

export const createAppCommandMenuItem = (
  command: AppCommand,
  dispatchCommand: (command: AppCommand) => void
) => {
  const config = getAppCommandConfig(command)
  return createCommandMenuItem(config.label, config.accelerator, () => dispatchCommand(command))
}

export const createRecentFilesSubmenu = (
  recentDocuments: RecentDocument[],
  options: {
    onClearRecentFiles: () => void
    onOpenRecentFile: (pathname: string) => void
  }
): MenuItem[] => {
  const { onClearRecentFiles, onOpenRecentFile } = options

  if (recentDocuments.length === 0) {
    return [{
      label: 'No Recent Files',
      enabled: false
    }]
  }

  return [
    ...recentDocuments.map(document => ({
      label: document.filename,
      sublabel: document.pathname,
      click: () => {
        onOpenRecentFile(document.pathname)
      }
    })),
    { type: 'separator' as const },
    {
      label: 'Clear Recent Files',
      click: onClearRecentFiles
    }
  ]
}

export const createViewSubmenu = (isDev: boolean): MenuItem[] => ([
  { role: 'reload' as const },
  { role: 'forceReload' as const },
  ...(isDev ? [{ role: 'toggleDevTools' as const }] : []),
  { type: 'separator' as const },
  { role: 'resetZoom' as const },
  { role: 'zoomIn' as const },
  { role: 'zoomOut' as const },
  { type: 'separator' as const },
  { role: 'togglefullscreen' as const }
])

export const createWindowSubmenu = (isMac: boolean): MenuItem[] => ([
  { role: 'minimize' as const },
  { role: 'zoom' as const },
  ...(isMac
    ? [
        { type: 'separator' as const },
        { role: 'front' as const },
        { type: 'separator' as const },
        { role: 'window' as const }
      ]
    : [{ role: 'close' as const }])
])

export const createMacAppMenu = (appName: string, isMac: boolean): MenuItem[] => {
  if (!isMac) {
    return []
  }

  return [{
    label: appName,
    submenu: [
      { role: 'about' as const },
      { type: 'separator' as const },
      { role: 'services' as const },
      { type: 'separator' as const },
      { role: 'hide' as const },
      { role: 'hideOthers' as const },
      { role: 'unhide' as const },
      { type: 'separator' as const },
      { role: 'quit' as const }
    ]
  }]
}

export const createApplicationMenuTemplate = ({
  appName,
  dispatchAppCommand,
  isDev,
  isMac,
  recentFilesSubmenu
}: {
  appName: string
  dispatchAppCommand: (command: AppCommand) => void
  isDev: boolean
  isMac: boolean
  recentFilesSubmenu: MenuItem[]
}): MenuItem[] => {
  return [
    ...createMacAppMenu(appName, isMac),
    {
      label: 'File',
      submenu: createFileSubmenu(
        recentFilesSubmenu,
        isMac,
        createAppCommandMenuItem,
        dispatchAppCommand
      )
    },
    {
      label: 'Edit',
      submenu: createEditSubmenu(createAppCommandMenuItem, dispatchAppCommand)
    },
    {
      label: 'View',
      submenu: createViewSubmenu(isDev)
    },
    {
      label: 'Window',
      submenu: createWindowSubmenu(isMac)
    }
  ]
}
