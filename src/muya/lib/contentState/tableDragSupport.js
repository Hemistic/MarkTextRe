import { calculateAspects, getAllTableCells, getIndex, getDragCells } from './tableDomUtils'

export const handleMouseDown = (contentState, event) => {
  event.preventDefault()
  const { eventCenter } = contentState.muya
  const { clientX, clientY, target } = event
  const tableId = target.closest('table').id
  const barType = target.classList.contains('left') ? 'left' : 'bottom'
  const index = getIndex(barType, target)

  contentState.dragInfo = {
    tableId,
    clientX,
    clientY,
    barType,
    index,
    curIndex: index,
    dragCells: getDragCells(tableId, barType, index),
    cells: getAllTableCells(tableId),
    aspects: calculateAspects(tableId, barType),
    offset: 0
  }

  for (const row of contentState.dragInfo.cells) {
    for (const cell of row) {
      if (!contentState.dragInfo.dragCells.includes(cell)) {
        cell.classList.add('ag-cell-transform')
      }
    }
  }

  const mouseMoveId = eventCenter.attachDOMEvent(document, 'mousemove', contentState.handleMouseMove.bind(contentState))
  const mouseUpId = eventCenter.attachDOMEvent(document, 'mouseup', contentState.handleMouseUp.bind(contentState))
  contentState.dragEventIds.push(mouseMoveId, mouseUpId)
}

export const handleMouseMove = (contentState, event) => {
  if (!contentState.dragInfo) {
    return
  }
  const { barType } = contentState.dragInfo
  const attrName = barType === 'bottom' ? 'clientX' : 'clientY'
  const offset = contentState.dragInfo.offset = event[attrName] - contentState.dragInfo[attrName]
  if (Math.abs(offset) < 5) {
    return
  }
  contentState.isDragTableBar = true
  hideUnnecessaryBar(contentState)
  calculateCurIndex(contentState)
  setDragTargetStyle(contentState)
  setSwitchStyle(contentState)
}

export const handleMouseUp = (contentState, event) => {
  const { eventCenter } = contentState.muya
  for (const id of contentState.dragEventIds) {
    eventCenter.detachDOMEvent(id)
  }
  contentState.dragEventIds = []
  if (!contentState.isDragTableBar) {
    return
  }

  setDropTargetStyle(contentState)
  setTimeout(() => {
    switchTableData(contentState)
    resetDragTableBar(contentState)
  }, 300)
}

export const hideUnnecessaryBar = contentState => {
  const { barType } = contentState.dragInfo
  const hideClassName = barType === 'bottom' ? 'left' : 'bottom'
  const needHideBar = document.querySelector(`.ag-drag-handler.${hideClassName}`)
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

export const setDragTargetStyle = contentState => {
  const { offset, barType, dragCells } = contentState.dragInfo

  for (const cell of dragCells) {
    if (!cell.classList.contains('ag-drag-cell')) {
      cell.classList.add('ag-drag-cell')
      cell.classList.add(`ag-drag-${barType}`)
    }
    const valueName = barType === 'bottom' ? 'translateX' : 'translateY'
    cell.style.transform = `${valueName}(${offset}px)`
  }
}

export const setSwitchStyle = contentState => {
  const { index, offset, curIndex, barType, aspects, cells } = contentState.dragInfo
  const aspect = aspects[index]
  const len = aspects.length

  if (offset > 0) {
    if (barType === 'bottom') {
      for (const row of cells) {
        for (let i = 0; i < len; i++) {
          const cell = row[i]
          if (i > index && i <= curIndex) {
            cell.style.transform = `translateX(${-aspect}px)`
          } else if (i !== index) {
            cell.style.transform = 'translateX(0px)'
          }
        }
      }
    } else {
      for (let i = 0; i < len; i++) {
        const row = cells[i]
        for (const cell of row) {
          if (i > index && i <= curIndex) {
            cell.style.transform = `translateY(${-aspect}px)`
          } else if (i !== index) {
            cell.style.transform = 'translateY(0px)'
          }
        }
      }
    }
  } else {
    if (barType === 'bottom') {
      for (const row of cells) {
        for (let i = 0; i < len; i++) {
          const cell = row[i]
          if (i >= curIndex && i < index) {
            cell.style.transform = `translateX(${aspect}px)`
          } else if (i !== index) {
            cell.style.transform = 'translateX(0px)'
          }
        }
      }
    } else {
      for (let i = 0; i < len; i++) {
        const row = cells[i]
        for (const cell of row) {
          if (i >= curIndex && i < index) {
            cell.style.transform = `translateY(${aspect}px)`
          } else if (i !== index) {
            cell.style.transform = 'translateY(0px)'
          }
        }
      }
    }
  }
}

export const setDropTargetStyle = contentState => {
  const { dragCells, barType, curIndex, index, aspects, offset } = contentState.dragInfo
  let move = 0
  if (offset > 0) {
    for (let i = index + 1; i <= curIndex; i++) {
      move += aspects[i]
    }
  } else {
    for (let i = curIndex; i < index; i++) {
      move -= aspects[i]
    }
  }
  for (const cell of dragCells) {
    cell.classList.remove('ag-drag-cell')
    cell.classList.remove(`ag-drag-${barType}`)
    cell.classList.add('ag-cell-transform')
    const valueName = barType === 'bottom' ? 'translateX' : 'translateY'
    cell.style.transform = `${valueName}(${move}px)`
  }
}

export const switchTableData = contentState => {
  const { barType, index, curIndex, tableId, offset } = contentState.dragInfo
  const table = contentState.getBlock(tableId)
  const tHead = table.children[0]
  const tBody = table.children[1]
  const rows = [tHead.children[0], ...(tBody ? tBody.children : [])]

  if (index !== curIndex) {
    const { start, end } = contentState.cursor
    let key = null
    if (barType === 'bottom') {
      for (const row of rows) {
        const isCursorCell = row.children[index].children[0].key === start.key
        const { text } = row.children[index].children[0]
        const { align } = row.children[index]
        if (offset > 0) {
          for (let i = index; i < curIndex; i++) {
            row.children[i].children[0].text = row.children[i + 1].children[0].text
            row.children[i].align = row.children[i + 1].align
          }
          row.children[curIndex].children[0].text = text
          row.children[curIndex].align = align
        } else {
          for (let i = index; i > curIndex; i--) {
            row.children[i].children[0].text = row.children[i - 1].children[0].text
            row.children[i].align = row.children[i - 1].align
          }
          row.children[curIndex].children[0].text = text
          row.children[curIndex].align = align
        }
        if (isCursorCell) {
          key = row.children[curIndex].children[0].key
        }
      }
    } else {
      let column = null
      const temp = rows[index].children.map((cell, i) => {
        if (cell.children[0].key === start.key) {
          column = i
        }
        return cell.children[0].text
      })
      if (offset > 0) {
        for (let i = index; i < curIndex; i++) {
          rows[i].children.forEach((cell, ii) => {
            cell.children[0].text = rows[i + 1].children[ii].children[0].text
          })
        }
        rows[curIndex].children.forEach((cell, i) => {
          if (i === column) {
            key = cell.children[0].key
          }
          cell.children[0].text = temp[i]
        })
      } else {
        for (let i = index; i > curIndex; i--) {
          rows[i].children.forEach((cell, ii) => {
            cell.children[0].text = rows[i - 1].children[ii].children[0].text
          })
        }
        rows[curIndex].children.forEach((cell, i) => {
          if (i === column) {
            key = cell.children[0].key
          }
          cell.children[0].text = temp[i]
        })
      }
    }

    if (key) {
      contentState.cursor = {
        start: {
          key,
          offset: start.offset
        },
        end: {
          key,
          offset: end.offset
        }
      }
      return contentState.singleRender(table)
    }
    return contentState.partialRender()
  }
}

export const resetDragTableBar = contentState => {
  contentState.dragInfo = null
  contentState.isDragTableBar = false
}
