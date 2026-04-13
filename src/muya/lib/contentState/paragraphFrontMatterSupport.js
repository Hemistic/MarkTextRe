import { getContentStateOptions } from './runtimeOptionSupport'
import { dispatchContentStateEvent } from './runtimeEventSupport'

export const handleFrontMatter = contentState => {
  const firstBlock = contentState.blocks[0]
  if (firstBlock.type === 'pre' && firstBlock.functionType === 'frontmatter') return

  const { frontmatterType } = getContentStateOptions(contentState)
  let lang
  let style
  switch (frontmatterType) {
    case '+':
      lang = 'toml'
      style = '+'
      break
    case ';':
      lang = 'json'
      style = ';'
      break
    case '{':
      lang = 'json'
      style = '{'
      break
    default:
      lang = 'yaml'
      style = '-'
      break
  }

  const frontMatter = contentState.createBlock('pre', {
    functionType: 'frontmatter',
    lang,
    style
  })
  const codeBlock = contentState.createBlock('code', {
    lang
  })
  const emptyCodeContent = contentState.createBlock('span', {
    functionType: 'codeContent',
    lang
  })

  contentState.appendChild(codeBlock, emptyCodeContent)
  contentState.appendChild(frontMatter, codeBlock)
  contentState.insertBefore(frontMatter, firstBlock)
  const { key } = emptyCodeContent
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const showTablePicker = contentState => {
  const reference = contentState.getPositionReference()
  const handler = (rows, columns) => {
    contentState.createTable({ rows: rows + 1, columns: columns + 1 })
  }
  dispatchContentStateEvent(contentState, 'muya-table-picker', { row: -1, column: -1 }, reference, handler.bind(contentState))
}
