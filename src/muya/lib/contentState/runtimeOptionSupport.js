export const getContentStateOptions = contentState => {
  return contentState && contentState.muya && contentState.muya.options
    ? contentState.muya.options
    : {}
}

export const getContentStateOption = (contentState, key, defaultValue = undefined) => {
  const options = getContentStateOptions(contentState)
  return Object.prototype.hasOwnProperty.call(options, key)
    ? options[key]
    : defaultValue
}
