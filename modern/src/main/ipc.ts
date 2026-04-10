import path from 'node:path'
import { promises as fs } from 'node:fs'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import type { EditorDocument, SaveDocumentInput, SaveDocumentResult } from '@shared/contracts'
import { IPC_CHANNELS } from '@shared/ipc'

const createDocument = (pathname: string, markdown: string): EditorDocument => ({
  id: pathname,
  pathname,
  filename: path.basename(pathname),
  markdown,
  dirty: false
})

export const registerIpcHandlers = () => {
  ipcMain.handle(IPC_CHANNELS.app.getBootstrap, () => {
    return {
      appName: 'MarkText Modern',
      platform: process.platform,
      versions: {
        chrome: process.versions.chrome,
        electron: process.versions.electron,
        node: process.versions.node,
        v8: process.versions.v8
      }
    }
  })

  ipcMain.handle(IPC_CHANNELS.files.openMarkdown, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Open Markdown File',
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'txt'] }
      ],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const pathname = result.filePaths[0]
    const markdown = await fs.readFile(pathname, 'utf8')
    return createDocument(pathname, markdown)
  })

  ipcMain.handle(IPC_CHANNELS.files.openMarkdownAtPath, async (_event, pathname: string) => {
    try {
      const markdown = await fs.readFile(pathname, 'utf8')
      return createDocument(pathname, markdown)
    } catch {
      return null
    }
  })

  ipcMain.handle(IPC_CHANNELS.files.saveMarkdown, async (_event, input: SaveDocumentInput) => {
    let pathname = input.pathname

    if (!pathname) {
      const result = await dialog.showSaveDialog({
        title: 'Save Markdown File',
        defaultPath: input.filename || 'untitled.md',
        filters: [
          { name: 'Markdown', extensions: ['md', 'markdown'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return null
      }

      pathname = result.filePath
    }

    await fs.writeFile(pathname, input.markdown, 'utf8')

    const output: SaveDocumentResult = {
      pathname,
      filename: path.basename(pathname)
    }

    return output
  })

  ipcMain.handle(IPC_CHANNELS.window.minimize, event => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.window.maximize, event => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return

    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })

  ipcMain.handle(IPC_CHANNELS.window.close, event => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}
