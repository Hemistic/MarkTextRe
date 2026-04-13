export const getListType = (bull, raw) => {
  if (bull.length > 1) {
    return 'order'
  }

  return /^( {0,3})([-*+]) \[[xX ]\]/.test(raw) ? 'task' : 'bullet'
}

export const createListStartToken = (bull, raw) => {
  const ordered = bull.length > 1

  return {
    type: 'list_start',
    ordered,
    listType: getListType(bull, raw),
    start: ordered ? +(bull.slice(0, -1)) : ''
  }
}

export const stripListItemBullet = (item, bull) => {
  let newBull
  const originalLength = item.length
  const strippedItem = item.replace(/^ *([*+-]|\d+(?:\.|\))) {0,4}/, function (m, p1) {
    newBull = p1 || bull
    return ''
  })

  return {
    item: strippedItem,
    newBull,
    space: originalLength
  }
}

export const extractTaskListState = (item, rules, useGfm) => {
  if (!useGfm) {
    return {
      item,
      checked: undefined,
      isTaskListItem: false,
      spaceDelta: 0
    }
  }

  const checkedMatch = rules.checkbox.exec(item)
  if (!checkedMatch) {
    return {
      item,
      checked: undefined,
      isTaskListItem: false,
      spaceDelta: 0
    }
  }

  return {
    item: item.replace(rules.checkbox, ''),
    checked: checkedMatch[1] === 'x' || checkedMatch[1] === 'X',
    isTaskListItem: true,
    spaceDelta: 4
  }
}

export const shouldStartNewList = (
  bull,
  newBull,
  isOrdered,
  newIsOrdered,
  isTaskList,
  newIsTaskListItem
) => {
  return (
    (!isOrdered && !newIsOrdered && bull !== newBull) ||
    (isOrdered && newIsOrdered && bull.slice(-1) !== newBull.slice(-1)) ||
    (isOrdered !== newIsOrdered) ||
    (isTaskList !== newIsTaskListItem)
  )
}

export const outdentListItem = (item, space, pedantic) => {
  if (!~item.indexOf('\n ')) {
    return item
  }

  const indent = space - item.length
  return !pedantic
    ? item.replace(new RegExp('^ {1,' + indent + '}', 'gm'), '')
    : item.replace(/^ {1,4}/gm, '')
}

export const shouldBackpedalList = (bull, nextBullet, smartLists) => {
  return bull.length > 1
    ? nextBullet.length === 1
    : (nextBullet.length > 1 || (smartLists && nextBullet !== bull))
}

export const computeLooseState = (item, prevItem, index, total, next) => {
  let loose = next || /\n\n(?!\s*$)/.test(item)
  let nextState = loose

  if (!loose && (index !== 0 || total > 1) && prevItem.length !== 0 && prevItem.charAt(prevItem.length - 1) === '\n') {
    loose = true
    nextState = true
  }

  return {
    loose,
    next: nextState
  }
}

export const createListItemStartToken = (bull, isTaskList, checked, loose) => {
  const isOrderedListItem = /\d/.test(bull)

  return {
    checked,
    listItemType: bull.length > 1 ? 'order' : (isTaskList ? 'task' : 'bullet'),
    bulletMarkerOrDelimiter: isOrderedListItem ? bull.slice(-1) : bull.charAt(0),
    type: loose ? 'loose_item_start' : 'list_item_start'
  }
}
