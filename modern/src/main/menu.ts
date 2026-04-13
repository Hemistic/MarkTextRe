import { app, Menu } from 'electron'
import { clearRecentDocuments, readRecentDocuments } from './recent-documents'
import { legacyMainCommandAdapter } from './app-command-dispatcher'
import {
  createApplicationMenuTemplate,
  createRecentFilesSubmenu,
} from './menu-support'

type MenuItem = Electron.MenuItemConstructorOptions
const commandAdapter = legacyMainCommandAdapter

const createRecentFilesMenu = async (): Promise<MenuItem[]> => {
  const recentDocuments = await readRecentDocuments()
  return createRecentFilesSubmenu(recentDocuments, {
    onOpenRecentFile: pathname => {
      commandAdapter.dispatchOpenPath(pathname)
    },
    onClearRecentFiles: () => {
      void clearRecentDocuments().then(() => refreshApplicationMenu())
    }
  })
}

const buildApplicationMenu = async () => {
  const isMac = process.platform === 'darwin'
  const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)
  const recentFilesSubmenu = await createRecentFilesMenu()

  const template: MenuItem[] = createApplicationMenuTemplate({
    appName: app.name,
    dispatchAppCommand: commandAdapter.dispatchAppCommand,
    isDev,
    isMac,
    recentFilesSubmenu
  })

  return Menu.buildFromTemplate(template)
}

export const refreshApplicationMenu = async () => {
  Menu.setApplicationMenu(await buildApplicationMenu())
}

export const installApplicationMenu = async () => {
  await refreshApplicationMenu()
}
