export const tryHandleTrailingNewlineInsert = ({
  contentState,
  block,
  cursor,
  event
}) => {
  if (!block || !cursor) {
    return false
  }

  const { start } = cursor
  const { start: oldStart, end: oldEnd } = contentState.cursor || {}

  if (
    !oldStart ||
    !oldEnd ||
    oldStart.key !== oldEnd.key ||
    oldStart.offset !== oldEnd.offset ||
    !block.text.endsWith('\n') ||
    oldStart.offset !== block.text.length ||
    event.inputType !== 'insertText'
  ) {
    return false
  }

  const key = start.key
  block.text += event.data
  const offset = block.text.length
  contentState.cursor = {
    anchor: { key, offset },
    focus: { key, offset },
    start: { key, offset },
    end: { key, offset }
  }
  contentState.singleRender(block)
  return true
}
