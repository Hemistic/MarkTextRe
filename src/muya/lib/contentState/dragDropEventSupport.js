import { createGhost, hideGhost } from './dragDropGhostSupport'

let dragDropImageSupportPromise = null

const loadDragDropImageSupport = async () => {
  if (!dragDropImageSupportPromise) {
    dragDropImageSupportPromise = import('./dragDropImageSupport')
  }

  return dragDropImageSupportPromise
}

export const dragoverHandler = (contentState, event) => {
  // Cancel to allow tab drag&drop.
  if (!event.dataTransfer.types.length) {
    event.dataTransfer.dropEffect = 'none'
    return
  }

  if (event.dataTransfer.types.includes('text/uri-list')) {
    const items = Array.from(event.dataTransfer.items)
    const hasUriItem = items.some(i => i.type === 'text/uri-list')
    const hasTextItem = items.some(i => i.type === 'text/plain')
    const hasHtmlItem = items.some(i => i.type === 'text/html')
    if (hasUriItem && hasHtmlItem && !hasTextItem) {
      createGhost(contentState, event)
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  if (event.dataTransfer.types.indexOf('Files') >= 0) {
    if (event.dataTransfer.items.length === 1 && event.dataTransfer.items[0].type.indexOf('image') > -1) {
      event.preventDefault()
      createGhost(contentState, event)
      event.dataTransfer.dropEffect = 'copy'
    }
  } else {
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'none'
  }
}

export const dragleaveHandler = contentState => {
  return hideGhost(contentState)
}

export const dropHandler = async (contentState, event) => {
  event.preventDefault()
  const { dropAnchor } = contentState
  hideGhost(contentState)
  const imageSupport = (event.dataTransfer.items.length || event.dataTransfer.files)
    ? await loadDragDropImageSupport()
    : null

  if (event.dataTransfer.items.length && imageSupport) {
    for (const item of event.dataTransfer.items) {
      if (item.kind === 'string' && item.type === 'text/uri-list') {
        imageSupport.handleUriListDrop(contentState, item, dropAnchor)
      }
    }
  }

  if (event.dataTransfer.files && imageSupport) {
    const fileList = []
    for (const file of event.dataTransfer.files) {
      fileList.push(file)
    }
    const image = fileList.find(file => /image/.test(file.type))
    if (image && dropAnchor) {
      await imageSupport.handleImageFileDrop(contentState, image, dropAnchor)
    }
  }
}
