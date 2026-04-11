const { contextBridge, ipcRenderer } = require('electron')

const IPC_CHANNELS = {
  app: {
    getBootstrap: 'marktext:app:get-bootstrap',
    setDirtyState: 'marktext:app:set-dirty-state',
    getSessionState: 'marktext:app:get-session-state',
    setSessionState: 'marktext:app:set-session-state',
    confirmCloseDocument: 'marktext:app:confirm-close-document',
    command: 'marktext:app:command',
    windowCloseRequest: 'marktext:app:window-close-request',
    windowCloseResponse: 'marktext:app:window-close-response'
  },
  files: {
    getRecentDocuments: 'marktext:files:get-recent-documents',
    removeRecentDocument: 'marktext:files:remove-recent-document',
    openMarkdown: 'marktext:files:open-markdown',
    openMarkdownAtPath: 'marktext:files:open-markdown-at-path',
    saveMarkdown: 'marktext:files:save-markdown',
    saveMarkdownAs: 'marktext:files:save-markdown-as'
  },
  window: {
    minimize: 'marktext:window:minimize',
    maximize: 'marktext:window:maximize',
    close: 'marktext:window:close'
  }
}

const closeCoordinator = {
  getDirtyDocuments: async () => [],
  saveAllDirtyDocuments: async () => false
}
const appCommandHandlers = new Set()

ipcRenderer.on(IPC_CHANNELS.app.command, (_event, message) => {
  for (const handler of Array.from(appCommandHandlers)) {
    try {
      handler(message)
    } catch (error) {
      console.error('[preload] app command handler failed', error)
    }
  }
})

ipcRenderer.on(IPC_CHANNELS.app.windowCloseRequest, async (_event, request) => {
  try {
    if (request.kind === 'get-dirty-documents') {
      const dirtyDocuments = await closeCoordinator.getDirtyDocuments()
      ipcRenderer.send(IPC_CHANNELS.app.windowCloseResponse, {
        requestId: request.requestId,
        dirtyDocuments,
        ok: true
      })
      return
    }

    if (request.kind === 'save-all-dirty-documents') {
      const ok = await closeCoordinator.saveAllDirtyDocuments()
      ipcRenderer.send(IPC_CHANNELS.app.windowCloseResponse, {
        requestId: request.requestId,
        ok
      })
    }
  } catch (error) {
    ipcRenderer.send(IPC_CHANNELS.app.windowCloseResponse, {
      requestId: request.requestId,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

contextBridge.exposeInMainWorld('marktext', {
  app: {
    getBootstrap: () => ipcRenderer.invoke(IPC_CHANNELS.app.getBootstrap),
    setDirtyState: hasDirtyDocuments => ipcRenderer.invoke(IPC_CHANNELS.app.setDirtyState, hasDirtyDocuments),
    getSessionState: () => ipcRenderer.invoke(IPC_CHANNELS.app.getSessionState),
    setSessionState: sessionState => ipcRenderer.invoke(IPC_CHANNELS.app.setSessionState, sessionState),
    confirmCloseDocument: filename => ipcRenderer.invoke(IPC_CHANNELS.app.confirmCloseDocument, filename),
    registerAppCommandHandler: handler => {
      if (typeof handler !== 'function') {
        return () => {}
      }

      appCommandHandlers.add(handler)

      return () => {
        appCommandHandlers.delete(handler)
      }
    },
    registerWindowCloseCoordinator: coordinator => {
      if (coordinator && typeof coordinator.getDirtyDocuments === 'function') {
        closeCoordinator.getDirtyDocuments = coordinator.getDirtyDocuments
      }

      if (coordinator && typeof coordinator.saveAllDirtyDocuments === 'function') {
        closeCoordinator.saveAllDirtyDocuments = coordinator.saveAllDirtyDocuments
      }
    }
  },
  files: {
    getRecentDocuments: () => ipcRenderer.invoke(IPC_CHANNELS.files.getRecentDocuments),
    removeRecentDocument: pathname => ipcRenderer.invoke(IPC_CHANNELS.files.removeRecentDocument, pathname),
    openMarkdown: () => ipcRenderer.invoke(IPC_CHANNELS.files.openMarkdown),
    openMarkdownAtPath: pathname => ipcRenderer.invoke(IPC_CHANNELS.files.openMarkdownAtPath, pathname),
    saveMarkdown: input => ipcRenderer.invoke(IPC_CHANNELS.files.saveMarkdown, input),
    saveMarkdownAs: input => ipcRenderer.invoke(IPC_CHANNELS.files.saveMarkdownAs, input)
  },
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.window.minimize),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.window.maximize),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.window.close)
  }
})
