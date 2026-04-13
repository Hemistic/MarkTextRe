export const createWindowCloseState = () => {
  const dirtyWindows = new Map<number, boolean>()
  const closingWindows = new Set<number>()
  const pendingCloseWindows = new Set<number>()

  const hasDirtyDocuments = (windowId: number) => {
    return Boolean(dirtyWindows.get(windowId))
  }

  const setDirtyState = (windowId: number, hasDirty: boolean) => {
    dirtyWindows.set(windowId, hasDirty)
  }

  const markClosing = (windowId: number) => {
    closingWindows.add(windowId)
  }

  const shouldAllowNativeClose = (windowId: number) => {
    return closingWindows.has(windowId) || !hasDirtyDocuments(windowId)
  }

  const beginPendingClose = (windowId: number) => {
    if (pendingCloseWindows.has(windowId)) {
      return false
    }

    pendingCloseWindows.add(windowId)
    return true
  }

  const finishPendingClose = (windowId: number) => {
    pendingCloseWindows.delete(windowId)
  }

  const cleanupWindow = (windowId: number) => {
    dirtyWindows.delete(windowId)
    closingWindows.delete(windowId)
    pendingCloseWindows.delete(windowId)
  }

  return {
    beginPendingClose,
    cleanupWindow,
    finishPendingClose,
    hasDirtyDocuments,
    markClosing,
    setDirtyState,
    shouldAllowNativeClose
  }
}
