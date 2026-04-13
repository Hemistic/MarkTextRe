const createWindowApi = ({ channels, invoke }) => {
  const { window } = channels

  return {
    minimize: () => invoke(window.minimize),
    maximize: () => invoke(window.maximize),
    close: () => invoke(window.close),
    toggleDevTools: () => invoke(window.toggleDevTools)
  }
}

module.exports = {
  createWindowApi
}
