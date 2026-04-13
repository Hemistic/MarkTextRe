const createAppCommandSubscriptions = (ipcRenderer, commandChannel) => {
  const handlers = new Set()

  const handleCommandMessage = (_event, message) => {
    for (const handler of Array.from(handlers)) {
      try {
        handler(message)
      } catch (error) {
        console.error('[preload] app command handler failed', error)
      }
    }
  }

  ipcRenderer.on(commandChannel, handleCommandMessage)

  const subscribe = handler => {
    if (typeof handler !== 'function') {
      return () => {}
    }

    handlers.add(handler)
    return () => {
      handlers.delete(handler)
    }
  }

  return {
    subscribe
  }
}

module.exports = {
  createAppCommandSubscriptions
}

