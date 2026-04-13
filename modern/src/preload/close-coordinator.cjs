const DEFAULT_CLOSE_COORDINATOR = Object.freeze({
  getDirtyDocuments: async () => [],
  saveAllDirtyDocuments: async () => false
})

const createWindowCloseCoordinatorBridge = (ipcRenderer, channels) => {
  const coordinator = {
    getDirtyDocuments: DEFAULT_CLOSE_COORDINATOR.getDirtyDocuments,
    saveAllDirtyDocuments: DEFAULT_CLOSE_COORDINATOR.saveAllDirtyDocuments
  }

  const sendResponse = payload => {
    ipcRenderer.send(channels.app.windowCloseResponse, payload)
  }

  const handleCloseRequest = async (_event, request) => {
    try {
      if (!request || typeof request.requestId !== 'string') {
        return
      }

      if (request.kind === 'get-dirty-documents') {
        const dirtyDocuments = await coordinator.getDirtyDocuments()
        sendResponse({
          requestId: request.requestId,
          dirtyDocuments,
          ok: true
        })
        return
      }

      if (request.kind === 'save-all-dirty-documents') {
        const ok = await coordinator.saveAllDirtyDocuments()
        sendResponse({
          requestId: request.requestId,
          ok
        })
      }
    } catch (error) {
      sendResponse({
        requestId: request?.requestId ?? '',
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  ipcRenderer.on(channels.app.windowCloseRequest, handleCloseRequest)

  const register = nextCoordinator => {
    if (!nextCoordinator || typeof nextCoordinator !== 'object') {
      return
    }

    if (typeof nextCoordinator.getDirtyDocuments === 'function') {
      coordinator.getDirtyDocuments = nextCoordinator.getDirtyDocuments
    }

    if (typeof nextCoordinator.saveAllDirtyDocuments === 'function') {
      coordinator.saveAllDirtyDocuments = nextCoordinator.saveAllDirtyDocuments
    }
  }

  return {
    register
  }
}

module.exports = {
  createWindowCloseCoordinatorBridge
}

