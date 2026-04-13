import {
  createListStartToken,
  stripListItemBullet,
  extractTaskListState,
  shouldStartNewList,
  outdentListItem,
  shouldBackpedalList,
  computeLooseState,
  createListItemStartToken,
  createTextToken
} from './lexerSupport'

export const lexListBlock = (lexer, src) => {
  let cap = lexer.rules.list.exec(src)
  if (!cap) {
    return { handled: false, src }
  }

  src = src.substring(cap[0].length)
  let bull = cap[2]
  let isOrdered = bull.length > 1
  lexer.tokens.push(createListStartToken(bull, cap[0]))

  let next = false
  let prevNext = true
  let listItemIndices = []
  let isTaskList = false

  cap = cap[0].match(lexer.rules.item)
  const l = cap.length

  for (let i = 0; i < l; i++) {
    const itemWithBullet = cap[i]
    let item = itemWithBullet

    const strippedItem = stripListItemBullet(item, bull)
    let newBull = strippedItem.newBull
    item = strippedItem.item
    let space = strippedItem.space

    const newIsOrdered = bull.length > 1 && /\d{1,9}/.test(newBull)
    let checked
    let newIsTaskListItem = false
    if (!newIsOrdered && lexer.options.gfm) {
      const taskState = extractTaskListState(item, lexer.rules, lexer.options.gfm)
      item = taskState.item
      checked = taskState.checked
      newIsTaskListItem = taskState.isTaskListItem
      space -= taskState.spaceDelta
    }

    if (i === 0) {
      isTaskList = newIsTaskListItem
    } else if (
      i !== 0 &&
      shouldStartNewList(bull, newBull, isOrdered, newIsOrdered, isTaskList, newIsTaskListItem)
    ) {
      lexer.tokens.push({ type: 'list_end' })

      bull = newBull
      isOrdered = newIsOrdered
      isTaskList = newIsTaskListItem
      lexer.tokens.push(createListStartToken(bull, itemWithBullet))
    }

    item = outdentListItem(item, space, lexer.options.pedantic)

    if (i !== l - 1) {
      const nextBullet = lexer.rules.bullet.exec(cap[i + 1])[0]
      if (shouldBackpedalList(bull, nextBullet, lexer.options.smartLists)) {
        src = cap.slice(i + 1).join('\n') + src
        i = l - 1
      }
    }

    const prevItem = i === 0 ? item : cap[i - 1]
    const looseState = computeLooseState(item, prevItem, i, l, next)
    const loose = looseState.loose
    next = looseState.next

    if (next && prevNext !== next) {
      for (const index of listItemIndices) {
        lexer.tokens[index].type = 'loose_item_start'
      }
      listItemIndices = []
    }
    prevNext = next

    if (!loose) {
      listItemIndices.push(lexer.tokens.length)
    }

    lexer.tokens.push(createListItemStartToken(bull, isTaskList, checked, loose))

    if (/^\s*$/.test(item)) {
      lexer.tokens.push(createTextToken(''))
    } else {
      lexer.token(item, false)
    }

    lexer.tokens.push({ type: 'list_item_end' })
  }

  lexer.tokens.push({ type: 'list_end' })
  return { handled: true, src }
}
