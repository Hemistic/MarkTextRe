const getRuntimeDocument = () => {
  return typeof document !== 'undefined'
    ? document
    : null
}

const getRuntimeWindow = () => {
  return typeof window !== 'undefined'
    ? window
    : null
}

export const getMuyaContainer = muya => {
  return muya && muya.container
    ? muya.container
    : null
}

export const getMuyaDocument = muya => {
  const container = getMuyaContainer(muya)
  return container && container.ownerDocument
    ? container.ownerDocument
    : getRuntimeDocument()
}

export const getMuyaWindow = muya => {
  const doc = getMuyaDocument(muya)
  return doc && doc.defaultView
    ? doc.defaultView
    : getRuntimeWindow()
}

export const getMuyaEventCenter = muya => {
  return muya && muya.eventCenter
    ? muya.eventCenter
    : null
}

export const getMuyaContentState = muya => {
  return muya && muya.contentState
    ? muya.contentState
    : null
}

export const getMuyaOptions = muya => {
  return muya && muya.options
    ? muya.options
    : {}
}

export const getMuyaKeyboard = muya => {
  return muya && muya.keyboard
    ? muya.keyboard
    : null
}

export const getMuyaClipboard = muya => {
  return muya && muya.clipboard
    ? muya.clipboard
    : null
}

export const getMuyaImagePathPicker = muya => {
  return muya && muya.imagePathPicker
    ? muya.imagePathPicker
    : null
}

export const triggerMuyaChange = muya => {
  if (muya && typeof muya.dispatchChange === 'function') {
    return muya.dispatchChange()
  }
}

export const triggerMuyaSelectionChange = muya => {
  if (muya && typeof muya.dispatchSelectionChange === 'function') {
    return muya.dispatchSelectionChange()
  }
}

export const triggerMuyaSelectionFormats = muya => {
  if (muya && typeof muya.dispatchSelectionFormats === 'function') {
    return muya.dispatchSelectionFormats()
  }
}

export const dispatchMuyaRuntimeEvent = (muya, name, ...args) => {
  const eventCenter = getMuyaEventCenter(muya)
  if (eventCenter && typeof eventCenter.dispatch === 'function') {
    return eventCenter.dispatch(name, ...args)
  }
}
