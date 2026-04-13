const createSettingsApi = ({ channels, invoke }) => {
  const { settings } = channels

  return {
    getState: () => invoke(settings.getState),
    updateState: patch => invoke(settings.updateState, patch),
    pickPath: (kind, currentPath) => invoke(settings.pickPath, kind, currentPath)
  }
}

module.exports = {
  createSettingsApi
}
