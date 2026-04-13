export const dispatchMuyaSelectionChange = muya => {
  const selectionChanges = muya.contentState.selectionChange()

  muya.eventCenter.dispatch('selectionChange', selectionChanges)
}

export const dispatchMuyaSelectionFormats = muya => {
  const { formats } = muya.contentState.selectionFormats()

  muya.eventCenter.dispatch('selectionFormats', formats)
}
