const exposeMarkTextApi = ({ contextBridge, createMarkTextApi, ipcRenderer }) => {
  const api = createMarkTextApi(ipcRenderer)
  contextBridge.exposeInMainWorld('marktext', api)
  return api
}

module.exports = {
  exposeMarkTextApi
}
