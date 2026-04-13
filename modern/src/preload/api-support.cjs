const freezeMarkTextApi = api => {
  return Object.freeze({
    app: Object.freeze(api.app),
    files: Object.freeze(api.files),
    window: Object.freeze(api.window)
  })
}

module.exports = {
  freezeMarkTextApi
}
