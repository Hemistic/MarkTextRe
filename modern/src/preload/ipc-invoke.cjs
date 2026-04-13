const createIpcInvoker = ipcRenderer => {
  return (channel, ...args) => ipcRenderer.invoke(channel, ...args)
}

module.exports = {
  createIpcInvoker
}
