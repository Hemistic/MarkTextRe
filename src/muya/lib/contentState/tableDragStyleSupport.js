import {
  setDragTargetStyle,
  setSwitchStyle,
  setDropTargetStyle
} from './tableDragTransformSupport'
import { queryContentState } from './runtimeDomSupport'

export const hideUnnecessaryBar = contentState => {
  const { barType } = contentState.dragInfo
  const hideClassName = barType === 'bottom' ? 'left' : 'bottom'
  const needHideBar = queryContentState(contentState, `.ag-drag-handler.${hideClassName}`)
  if (needHideBar) {
    needHideBar.style.display = 'none'
  }
}

export const calculateCurIndex = contentState => {
  let { offset, aspects, index } = contentState.dragInfo
  let curIndex = index
  const len = aspects.length
  if (offset > 0) {
    for (let i = index; i < len; i++) {
      const aspect = aspects[i]
      if (i === index) {
        offset -= Math.floor(aspect / 2)
      } else {
        offset -= aspect
      }
      if (offset < 0) {
        break
      }
      curIndex++
    }
  } else if (offset < 0) {
    for (let i = index; i >= 0; i--) {
      const aspect = aspects[i]
      if (i === index) {
        offset += Math.floor(aspect / 2)
      } else {
        offset += aspect
      }
      if (offset > 0) {
        break
      }
      curIndex--
    }
  }

  contentState.dragInfo.curIndex = Math.max(0, Math.min(curIndex, len - 1))
}

export const resetDragTableBar = contentState => {
  contentState.dragInfo = null
  contentState.isDragTableBar = false
}

export {
  setDragTargetStyle,
  setSwitchStyle,
  setDropTargetStyle
}
