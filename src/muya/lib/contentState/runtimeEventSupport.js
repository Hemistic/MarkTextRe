export const dispatchContentStateChange = contentState => {
  const muya = contentState && contentState.muya
  if (muya && typeof muya.dispatchChange === 'function') {
    return muya.dispatchChange()
  }
}

export const dispatchContentStateSelectionChange = contentState => {
  const muya = contentState && contentState.muya
  if (muya && typeof muya.dispatchSelectionChange === 'function') {
    return muya.dispatchSelectionChange()
  }
}

export const dispatchContentStateSelectionFormats = contentState => {
  const muya = contentState && contentState.muya
  if (muya && typeof muya.dispatchSelectionFormats === 'function') {
    return muya.dispatchSelectionFormats()
  }
}

export const dispatchContentStateSelectionAndChange = contentState => {
  dispatchContentStateSelectionChange(contentState)
  dispatchContentStateSelectionFormats(contentState)
  return dispatchContentStateChange(contentState)
}

export const dispatchContentStateEvent = (contentState, name, ...args) => {
  const eventCenter = contentState && contentState.muya
    ? contentState.muya.eventCenter
    : null

  if (eventCenter && typeof eventCenter.dispatch === 'function') {
    return eventCenter.dispatch(name, ...args)
  }
}

export const dispatchContentStateStateChange = contentState => {
  return dispatchContentStateEvent(contentState, 'stateChange')
}
