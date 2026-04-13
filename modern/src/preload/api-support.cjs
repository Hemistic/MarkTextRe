const freezeMarkTextApi = api => {
  return Object.freeze({
    app: Object.freeze(api.app),
    files: Object.freeze(api.files),
    settings: Object.freeze(api.settings),
    window: Object.freeze(api.window)
  })
}

module.exports = {
  freezeMarkTextApi
}
