import { initializeContentStateState } from './runtimeStateInitSupport'
import { initializeContentStateHistory } from './runtimeHistoryInitSupport'

export const initializeContentState = (contentState, muya, options) => {
  const { bulletListMarker } = options

  contentState.muya = muya
  Object.assign(contentState, options)

  initializeContentStateState(contentState)
  initializeContentStateHistory(contentState, bulletListMarker)
}
