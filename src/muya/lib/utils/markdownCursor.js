import ExportMarkdown from './exportMarkdown'
import { CURSOR_ANCHOR_DNA, CURSOR_FOCUS_DNA } from '../config'

export const getCodeMirrorCursor = contentState => {
  const blocks = contentState.getBlocks()
  const { anchor, focus } = contentState.cursor
  const anchorBlock = contentState.getBlock(anchor.key)
  const focusBlock = contentState.getBlock(focus.key)
  const { text: anchorText } = anchorBlock
  const { text: focusText } = focusBlock

  if (anchor.key === focus.key) {
    const minOffset = Math.min(anchor.offset, focus.offset)
    const maxOffset = Math.max(anchor.offset, focus.offset)
    const firstTextPart = anchorText.substring(0, minOffset)
    const secondTextPart = anchorText.substring(minOffset, maxOffset)
    const thirdTextPart = anchorText.substring(maxOffset)
    anchorBlock.text = firstTextPart +
      (anchor.offset <= focus.offset ? CURSOR_ANCHOR_DNA : CURSOR_FOCUS_DNA) +
      secondTextPart +
      (anchor.offset <= focus.offset ? CURSOR_FOCUS_DNA : CURSOR_ANCHOR_DNA) +
      thirdTextPart
  } else {
    anchorBlock.text = anchorText.substring(0, anchor.offset) + CURSOR_ANCHOR_DNA + anchorText.substring(anchor.offset)
    focusBlock.text = focusText.substring(0, focus.offset) + CURSOR_FOCUS_DNA + focusText.substring(focus.offset)
  }

  const { isGitlabCompatibilityEnabled, listIndentation } = contentState
  const markdown = new ExportMarkdown(blocks, listIndentation, isGitlabCompatibilityEnabled).generate()
  const cursor = markdown.split('\n').reduce((acc, line, index) => {
    const ach = line.indexOf(CURSOR_ANCHOR_DNA)
    const fch = line.indexOf(CURSOR_FOCUS_DNA)
    if (ach > -1 && fch > -1) {
      if (ach <= fch) {
        Object.assign(acc.anchor, { line: index, ch: ach })
        Object.assign(acc.focus, { line: index, ch: fch - CURSOR_ANCHOR_DNA.length })
      } else {
        Object.assign(acc.focus, { line: index, ch: fch })
        Object.assign(acc.anchor, { line: index, ch: ach - CURSOR_FOCUS_DNA.length })
      }
    } else if (ach > -1) {
      Object.assign(acc.anchor, { line: index, ch: ach })
    } else if (fch > -1) {
      Object.assign(acc.focus, { line: index, ch: fch })
    }
    return acc
  }, {
    anchor: {
      line: 0,
      ch: 0
    },
    focus: {
      line: 0,
      ch: 0
    }
  })

  anchorBlock.text = anchorText
  focusBlock.text = focusText
  return cursor
}

export const addCursorToMarkdown = (markdown, cursor) => {
  const { anchor, focus } = cursor
  if (!anchor || !focus) {
    return
  }
  const lines = markdown.split('\n')
  const anchorText = lines[anchor.line]
  const focusText = lines[focus.line]
  if (!anchorText || !focusText) {
    return {
      markdown: lines.join('\n'),
      isValid: false
    }
  }
  if (anchor.line === focus.line) {
    const minOffset = Math.min(anchor.ch, focus.ch)
    const maxOffset = Math.max(anchor.ch, focus.ch)
    const firstTextPart = anchorText.substring(0, minOffset)
    const secondTextPart = anchorText.substring(minOffset, maxOffset)
    const thirdTextPart = anchorText.substring(maxOffset)
    lines[anchor.line] = firstTextPart +
      (anchor.ch <= focus.ch ? CURSOR_ANCHOR_DNA : CURSOR_FOCUS_DNA) +
      secondTextPart +
      (anchor.ch <= focus.ch ? CURSOR_FOCUS_DNA : CURSOR_ANCHOR_DNA) +
      thirdTextPart
  } else {
    lines[anchor.line] = anchorText.substring(0, anchor.ch) + CURSOR_ANCHOR_DNA + anchorText.substring(anchor.ch)
    lines[focus.line] = focusText.substring(0, focus.ch) + CURSOR_FOCUS_DNA + focusText.substring(focus.ch)
  }

  return {
    markdown: lines.join('\n'),
    isValid: true
  }
}

export const importCursor = (contentState, hasCursor) => {
  const cursor = {
    anchor: null,
    focus: null
  }

  let count = 0

  const travel = blocks => {
    for (const block of blocks) {
      let { key, text, children, editable } = block
      if (text) {
        const offset = text.indexOf(CURSOR_ANCHOR_DNA)
        if (offset > -1) {
          block.text = text.substring(0, offset) + text.substring(offset + CURSOR_ANCHOR_DNA.length)
          text = block.text
          count++
          if (editable) {
            cursor.anchor = { key, offset }
          }
        }
        const focusOffset = text.indexOf(CURSOR_FOCUS_DNA)
        if (focusOffset > -1) {
          block.text = text.substring(0, focusOffset) + text.substring(focusOffset + CURSOR_FOCUS_DNA.length)
          count++
          if (editable) {
            cursor.focus = { key, offset: focusOffset }
          }
        }
        if (count === 2) {
          break
        }
      } else if (children.length) {
        travel(children)
      }
    }
  }

  if (hasCursor) {
    travel(contentState.blocks)
  } else {
    const lastBlock = contentState.getLastBlock()
    const key = lastBlock.key
    const offset = lastBlock.text.length
    cursor.anchor = { key, offset }
    cursor.focus = { key, offset }
  }

  if (cursor.anchor && cursor.focus) {
    contentState.cursor = cursor
  }
}
