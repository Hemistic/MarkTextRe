import { app, BrowserWindow, Menu } from 'electron'
import type { AppCommand, AppCommandMessage } from '@shared/contracts'
import { IPC_CHANNELS } from '@shared/ipc'
import { clearRecentDocuments, readRecentDocuments } from './recent-documents'

type MenuItem = Electron.MenuItemConstructorOptions

export const dispatchAppCommand = (
  message: AppCommandMessage,
  targetWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
) => {
  if (!targetWindow || targetWindow.isDestroyed()) {
    return
  }

  targetWindow.webContents.send(IPC_CHANNELS.app.command, message)
}

const createCommandMenuItem = (
  label: string,
  accelerator: string,
  command: AppCommand
): MenuItem => ({
  label,
  accelerator,
  click: () => dispatchAppCommand({ command })
})

const createRecentFilesSubmenu = async (): Promise<MenuItem[]> => {
  const recentDocuments = await readRecentDocuments()

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
        dispatchAppCommand({
          command: 'open-path',
          pathname: document.pathname
        })
      }
    })),
    { type: 'separator' as const },
    {
      label: 'Clear Recent Files',
      click: () => {
        void clearRecentDocuments().then(() => refreshApplicationMenu())
      }
    }
  ]
}

const buildApplicationMenu = async () => {
  const isMac = process.platform === 'darwin'
  const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)
  const recentFilesSubmenu = await createRecentFilesSubmenu()

  const macAppMenu: MenuItem[] = isMac ? [{
    label: app.name,
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
  }] : []

  const viewSubmenu: MenuItem[] = [
    { role: 'reload' as const },
    { role: 'forceReload' as const },
    ...(isDev ? [{ role: 'toggleDevTools' as const }] : []),
    { type: 'separator' as const },
    { role: 'resetZoom' as const },
    { role: 'zoomIn' as const },
    { role: 'zoomOut' as const },
    { type: 'separator' as const },
    { role: 'togglefullscreen' as const }
  ]

  const windowSubmenu: MenuItem[] = [
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
  ]

  const template: MenuItem[] = [
    ...macAppMenu,
    {
      label: 'File',
      submenu: [
        createCommandMenuItem('New File', 'CmdOrCtrl+N', 'new-file'),
        createCommandMenuItem('Open...', 'CmdOrCtrl+O', 'open-file'),
        {
          label: 'Open Recent',
          submenu: recentFilesSubmenu
        },
        { type: 'separator' as const },
        createCommandMenuItem('Save', 'CmdOrCtrl+S', 'save-file'),
        createCommandMenuItem('Save As...', 'Shift+CmdOrCtrl+S', 'save-file-as'),
        { type: 'separator' as const },
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'delete' as const },
        { type: 'separator' as const },
        { role: 'selectAll' as const }
      ]
    },
    {
      label: 'View',
      submenu: viewSubmenu
    },
    {
      label: 'Window',
      submenu: windowSubmenu
    }
  ]

  return Menu.buildFromTemplate(template)
}

export const refreshApplicationMenu = async () => {
  Menu.setApplicationMenu(await buildApplicationMenu())
}

export const installApplicationMenu = async () => {
  await refreshApplicationMenu()
}
