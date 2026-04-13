import { CLASS_OR_ID } from '../../config'

export const checkEditEmoji = node => {
  if (node && node.classList.contains(CLASS_OR_ID.AG_EMOJI_MARKED_TEXT)) {
    return node
  }

  return false
}
