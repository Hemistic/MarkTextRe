import { CLASS_OR_ID } from '../config'
import selection from '../selection'
import { operateClassName } from '../utils/domManipulate'
import { getImageInfo } from '../utils/getImageInfo'
import {
  dispatchMuyaRuntimeEvent,
  getMuyaContainer,
  getMuyaContentState,
  getMuyaEventCenter
} from '../muyaRuntimeAccessSupport'

const getToolItem = target => target.closest('[data-label]')

const selectionText = node => {
  const textLen = node.textContent.length
  operateClassName(node, 'remove', CLASS_OR_ID.AG_HIDE)
  operateClassName(node, 'add', CLASS_OR_ID.AG_GRAY)
  selection.importSelection({
    start: textLen,
    end: textLen
  }, node)
}

export const bindClickHandler = clickEvent => {
  const container = getMuyaContainer(clickEvent.muya)
  const eventCenter = getMuyaEventCenter(clickEvent.muya)
  const contentState = getMuyaContentState(clickEvent.muya)
  if (!container || !eventCenter || !contentState) {
    return
  }

  const handler = event => {
    const { target } = event
    const toolItem = getToolItem(target)
    contentState.selectedImage = null
    contentState.selectedTableCells = null
    if (toolItem) {
      event.preventDefault()
      event.stopPropagation()
      const type = toolItem.getAttribute('data-label')
      const grandPa = toolItem.parentNode.parentNode
      if (grandPa.classList.contains('ag-tool-table')) {
        contentState.tableToolBarClick(type)
      }
    }

    if (target.classList.contains('ag-drag-handler')) {
      event.preventDefault()
      event.stopPropagation()
      const rect = target.getBoundingClientRect()
      const reference = {
        getBoundingClientRect () {
          return rect
        },
        width: rect.offsetWidth,
        height: rect.offsetHeight
      }
      eventCenter.dispatch('muya-table-bar', {
        reference,
        tableInfo: {
          barType: target.classList.contains('left') ? 'left' : 'bottom'
        }
      })
    }

    const markedImageText = target.previousElementSibling
    const mathRender = target.closest(`.${CLASS_OR_ID.AG_MATH_RENDER}`)
    const rubyRender = target.closest(`.${CLASS_OR_ID.AG_RUBY_RENDER}`)
    const imageWrapper = target.closest(`.${CLASS_OR_ID.AG_INLINE_IMAGE}`)
    const codeCopy = target.closest('.ag-code-copy')
    const footnoteBackLink = target.closest('.ag-footnote-backlink')
    const imageDelete = target.closest('.ag-image-icon-delete') || target.closest('.ag-image-icon-close')
    const mathText = mathRender && mathRender.previousElementSibling
    const rubyText = rubyRender && rubyRender.previousElementSibling
    if (markedImageText && markedImageText.classList.contains(CLASS_OR_ID.AG_IMAGE_MARKED_TEXT)) {
      eventCenter.dispatch('format-click', {
        event,
        formatType: 'image',
        data: event.target.getAttribute('src')
      })
      selectionText(markedImageText)
    } else if (mathText) {
      selectionText(mathText)
    } else if (rubyText) {
      selectionText(rubyText)
    }
    if (codeCopy) {
      event.stopPropagation()
      event.preventDefault()
      return contentState.copyCodeBlock(event)
    }

    if (imageDelete && imageWrapper) {
      const imageInfo = getImageInfo(imageWrapper)
      event.preventDefault()
      event.stopPropagation()
      dispatchMuyaRuntimeEvent(clickEvent.muya, 'muya-image-selector', { reference: null })
      return contentState.deleteImage(imageInfo)
    }

    if (footnoteBackLink) {
      event.preventDefault()
      event.stopPropagation()
      const figure = event.target.closest('figure')
      const identifier = figure.querySelector('span.ag-footnote-input').textContent
      if (identifier) {
        const footnoteIdentifier = container.querySelector(`#noteref-${identifier}`)
        if (footnoteIdentifier) {
          footnoteIdentifier.scrollIntoView({ behavior: 'smooth' })
        }
      }
      return
    }

    if (target.tagName === 'IMG' && imageWrapper) {
      const imageInfo = getImageInfo(imageWrapper)
      event.preventDefault()
      eventCenter.dispatch('select-image', imageInfo)
      const rect = imageWrapper.querySelector('.ag-image-container').getBoundingClientRect()
      const reference = {
        getBoundingClientRect () {
          return rect
        },
        width: imageWrapper.offsetWidth,
        height: imageWrapper.offsetHeight
      }
      eventCenter.dispatch('muya-image-toolbar', {
        reference,
        imageInfo
      })
      contentState.selectImage(imageInfo)
      const imageSelector = imageInfo.imageId.indexOf('_') > -1
        ? `#${imageInfo.imageId}`
        : `#${imageInfo.key}_${imageInfo.imageId}_${imageInfo.token.range.start}`

      const imageContainer = container.querySelector(`${imageSelector} .ag-image-container`)

      eventCenter.dispatch('muya-transformer', {
        reference: imageContainer,
        imageInfo
      })
      return
    }

    if (
      imageWrapper &&
      (
        imageWrapper.classList.contains('ag-empty-image') ||
        imageWrapper.classList.contains('ag-image-fail')
      )
    ) {
      const rect = imageWrapper.getBoundingClientRect()
      const reference = {
        getBoundingClientRect () {
          return rect
        }
      }
      const imageInfo = getImageInfo(imageWrapper)
      eventCenter.dispatch('muya-image-selector', {
        reference,
        imageInfo,
        cb: () => {}
      })
      event.preventDefault()
      return event.stopPropagation()
    }

    if (target.closest('div.ag-container-preview') || target.closest('div.ag-html-preview')) {
      event.stopPropagation()
      if (target.closest('div.ag-container-preview')) {
        event.preventDefault()
        const figureEle = target.closest('figure')
        contentState.handleContainerBlockClick(figureEle)
      }
      return
    }

    const editIcon = target.closest('.ag-container-icon')
    if (editIcon) {
      event.preventDefault()
      event.stopPropagation()
      if (editIcon.parentNode.classList.contains('ag-container-block')) {
        contentState.handleContainerBlockClick(editIcon.parentNode)
      }
    }

    if (target.tagName === 'INPUT' && target.classList.contains(CLASS_OR_ID.AG_TASK_LIST_ITEM_CHECKBOX)) {
      contentState.listItemCheckBoxClick(target)
    }
    contentState.clickHandler(event)
  }

  eventCenter.attachDOMEvent(container, 'click', handler)
}
