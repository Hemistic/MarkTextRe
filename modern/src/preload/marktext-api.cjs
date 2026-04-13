const { freezeMarkTextApi } = require('./api-support.cjs')
const { IPC_CHANNELS } = require('./ipc-contract.cjs')
const { createAppApi } = require('./app-api.cjs')
const { createFilesApi } = require('./file-api.cjs')
const { createIpcInvoker } = require('./ipc-invoke.cjs')
const { createSettingsApi } = require('./settings-api.cjs')
const { createWindowApi } = require('./window-api.cjs')

const createMarkTextApi = ipcRenderer => {
  const invoke = createIpcInvoker(ipcRenderer)

  return freezeMarkTextApi({
    app: createAppApi({ channels: IPC_CHANNELS, invoke, ipcRenderer }),
    files: createFilesApi({ channels: IPC_CHANNELS, invoke }),
    settings: createSettingsApi({ channels: IPC_CHANNELS, invoke }),
    window: createWindowApi({ channels: IPC_CHANNELS, invoke })
  })
}

module.exports = {
  createMarkTextApi
}
