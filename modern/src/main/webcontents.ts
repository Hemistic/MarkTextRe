import { BrowserWindow, Menu } from 'electron'
import type { BrowserWindow as BrowserWindowType, WebContents } from 'electron'

export const getSenderWindow = (sender: WebContents) => {
  return BrowserWindow.fromWebContents(sender)
}

export const attachWindowDevDiagnostics = (window: BrowserWindowType) => {
  const { webContents } = window

  webContents.on('console-message', details => {
    console.log(`[renderer:${details.level}] ${details.message} (${details.sourceId}:${details.lineNumber})`)
  })

  webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[renderer:load-fail] ${errorCode} ${errorDescription} ${validatedURL}`)
  })

  webContents.on('render-process-gone', (_event, details) => {
    console.error('[renderer:gone]', details)
  })

  webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error(`[preload:error] ${preloadPath}`, error)
  })
}

export const attachWindowContextMenu = (window: BrowserWindowType) => {
  const { webContents } = window

  webContents.on('context-menu', (_event, params) => {
    const template: Electron.MenuItemConstructorOptions[] = []

    if (params.isEditable) {
      if (params.misspelledWord && params.dictionarySuggestions.length > 0) {
        for (const suggestion of params.dictionarySuggestions) {
          template.push({
            label: suggestion,
            click: () => {
              webContents.replaceMisspelling(suggestion)
            }
          })
        }

        template.push({ type: 'separator' })
      }

      template.push(
        { role: 'undo', enabled: params.editFlags.canUndo },
        { role: 'redo', enabled: params.editFlags.canRedo },
        { type: 'separator' },
        { role: 'cut', enabled: params.editFlags.canCut },
        { role: 'copy', enabled: params.editFlags.canCopy },
        { role: 'paste', enabled: params.editFlags.canPaste },
        { type: 'separator' },
        { role: 'selectAll' }
      )
    } else {
      template.push(
        { role: 'copy', enabled: Boolean(params.selectionText) },
        { type: 'separator' },
        { role: 'selectAll' }
      )
    }

    if (process.env.VITE_DEV_SERVER_URL) {
      template.push(
        { type: 'separator' },
        {
          label: 'Inspect Element',
          click: () => {
            webContents.inspectElement(params.x, params.y)
          }
        }
      )
    }

    if (template.length === 0) {
      return
    }

    Menu.buildFromTemplate(template).popup({ window })
  })
}
