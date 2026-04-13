import { CLASS_OR_ID } from '../config'
import { matchesSelector } from '../utils/domQuerySupport'

export const resolveEditorRoot = container => {
  if (!container) {
    return null
  }

  if (matchesSelector(container, `#${CLASS_OR_ID.AG_EDITOR_ID}`)) {
    return container
  }

  if (typeof container.querySelector === 'function') {
    return container.querySelector(`#${CLASS_OR_ID.AG_EDITOR_ID}`) || container.firstElementChild || container
  }

  return null
}

