import { MUYA_DEFAULT_OPTION } from './config'
import {
  dispatchMuyaChange,
  dispatchMuyaSelectionChange,
  dispatchMuyaSelectionFormats,
  initializeMuyaRuntime,
} from './muyaRuntimeSupport'
import { applyMuyaInstanceApi } from './muyaInstanceApiSupport'

class Muya {
  static plugins = []

  static use (plugin, options = {}) {
    this.plugins.push({
      plugin,
      options
    })
  }

  constructor (container, options) {
    const mergedOptions = Object.assign({}, MUYA_DEFAULT_OPTION, options)
    initializeMuyaRuntime(this, container, mergedOptions, Muya.plugins)
    this.ready = this.init()
  }

  dispatchChange = () => dispatchMuyaChange(this)

  dispatchSelectionChange = () => dispatchMuyaSelectionChange(this)

  dispatchSelectionFormats = () => dispatchMuyaSelectionFormats(this)
}

applyMuyaInstanceApi(Muya)

export default Muya
