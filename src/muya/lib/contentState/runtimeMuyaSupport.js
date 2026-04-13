export const getContentStateMuya = contentState => {
  return contentState && contentState.muya
    ? contentState.muya
    : null
}

export const getContentStateEventCenter = contentState => {
  const muya = getContentStateMuya(contentState)
  return muya && muya.eventCenter
    ? muya.eventCenter
    : null
}

export const getContentStateKeyboard = contentState => {
  const muya = getContentStateMuya(contentState)
  return muya && muya.keyboard
    ? muya.keyboard
    : null
}

export const getContentStateClipboard = contentState => {
  const muya = getContentStateMuya(contentState)
  return muya && muya.clipboard
    ? muya.clipboard
    : null
}

export const blurContentState = (contentState, force = false) => {
  const muya = getContentStateMuya(contentState)
  if (muya && typeof muya.blur === 'function') {
    return muya.blur(force)
  }
}

export const hideContentStateFloatTools = contentState => {
  const keyboard = getContentStateKeyboard(contentState)
  if (keyboard && typeof keyboard.hideAllFloatTools === 'function') {
    return keyboard.hideAllFloatTools()
  }
}
