const { createAppCommandSubscriptions } = require('./app-command-subscriptions.cjs')
const { createWindowCloseCoordinatorBridge } = require('./close-coordinator.cjs')

const createAppApi = ({ channels, invoke, ipcRenderer }) => {
  const { app } = channels
  const appCommands = createAppCommandSubscriptions(ipcRenderer, app.command)
  const closeCoordinator = createWindowCloseCoordinatorBridge(ipcRenderer, channels)

  return {
    getBootstrap: () => invoke(app.getBootstrap),
    setDirtyState: hasDirtyDocuments => invoke(app.setDirtyState, hasDirtyDocuments),
    getSessionState: () => invoke(app.getSessionState),
    setSessionState: sessionState => invoke(app.setSessionState, sessionState),
    confirmCloseDocument: filename => invoke(app.confirmCloseDocument, filename),
    registerAppCommandHandler: handler => appCommands.subscribe(handler),
    registerWindowCloseCoordinator: coordinator => closeCoordinator.register(coordinator)
  }
}

module.exports = {
  createAppApi
}
