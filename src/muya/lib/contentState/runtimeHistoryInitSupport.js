import { DEFAULT_TURNDOWN_CONFIG } from '../config'
import History from './history'

export const initializeContentStateHistory = (contentState, bulletListMarker) => {
  contentState.history = new History(contentState)
  contentState.turndownConfig = Object.assign({}, DEFAULT_TURNDOWN_CONFIG, { bulletListMarker })
}
