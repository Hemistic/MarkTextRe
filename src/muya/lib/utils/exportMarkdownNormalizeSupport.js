export const normalizeParagraphText = function (block, indent) {
  const { text } = block
  const lines = text.split('\n')
  return lines.map(line => `${indent}${line}`).join('\n') + '\n'
}

export const normalizeHeaderText = function (block, indent) {
  const { headingStyle, marker } = block
  const { text } = block.children[0]
  if (headingStyle === 'atx') {
    const match = text.match(/(#{1,6})(.*)/)
    const atxHeadingText = `${match[1]} ${match[2].trim()}`
    return `${indent}${atxHeadingText}\n`
  } else if (headingStyle === 'setext') {
    const lines = text.trim().split('\n')
    return lines.map(line => `${indent}${line}`).join('\n') + `\n${indent}${marker.trim()}\n`
  }
}

export const normalizeBlockquote = function (block, indent) {
  const { children } = block
  const newIndent = `${indent}> `
  return this.translateBlocks2Markdown(children, newIndent)
}

export const normalizeFrontMatter = function (block) {
  let startToken
  let endToken
  switch (block.lang) {
    case 'yaml':
      startToken = '---\n'
      endToken = '---\n'
      break
    case 'toml':
      startToken = '+++\n'
      endToken = '+++\n'
      break
    case 'json':
      if (block.style === ';') {
        startToken = ';;;\n'
        endToken = ';;;\n'
      } else {
        startToken = '{\n'
        endToken = '}\n'
      }
      break
  }

  const result = []
  result.push(startToken)
  for (const line of block.children[0].children) {
    result.push(`${line.text}\n`)
  }
  result.push(endToken)
  return result.join('')
}

export const normalizeMultipleMath = function (block, indent) {
  let startToken = '$$'
  let endToken = '$$'
  if (this.isGitlabCompatibilityEnabled && block.mathStyle === 'gitlab') {
    startToken = '```math'
    endToken = '```'
  }

  const result = []
  result.push(`${indent}${startToken}\n`)
  for (const line of block.children[0].children[0].children) {
    result.push(`${indent}${line.text}\n`)
  }
  result.push(`${indent}${endToken}\n`)
  return result.join('')
}

export const normalizeContainer = function (block) {
  const result = []
  const diagramType = block.children[0].functionType
  result.push('```' + diagramType + '\n')
  for (const line of block.children[0].children[0].children) {
    result.push(`${line.text}\n`)
  }
  result.push('```\n')
  return result.join('')
}

export const normalizeCodeBlock = function (block, indent) {
  const result = []
  const codeContent = block.children[1].children[0]
  const textList = codeContent.text.split('\n')
  const { functionType } = block
  if (functionType === 'fencecode') {
    result.push(`${indent}${block.lang ? '```' + block.lang + '\n' : '```\n'}`)
    textList.forEach(text => {
      result.push(`${indent}${text}\n`)
    })
    result.push(indent + '```\n')
  } else {
    textList.forEach(text => {
      result.push(`${indent}    ${text}\n`)
    })
  }

  return result.join('')
}

export const normalizeHTML = function (block, indent) {
  const result = []
  const codeContentText = block.children[0].children[0].children[0].text
  const lines = codeContentText.split('\n')
  for (const line of lines) {
    result.push(`${indent}${line}\n`)
  }
  return result.join('')
}

export const normalizeTable = function (table, indent) {
  const result = []
  const { row, column } = table
  const tableData = []
  const tHeader = table.children[0]
  const tBody = table.children[1]
  const escapeText = str => {
    return str.replace(/([^\\])\|/g, '$1\\|')
  }

  tableData.push(tHeader.children[0].children.map(th => escapeText(th.children[0].text).trim()))
  if (tBody) {
    tBody.children.forEach(bodyRow => {
      tableData.push(bodyRow.children.map(td => escapeText(td.children[0].text).trim()))
    })
  }

  const columnWidth = tHeader.children[0].children.map(th => ({ width: 5, align: th.align }))

  for (let i = 0; i <= row; i++) {
    for (let j = 0; j <= column; j++) {
      columnWidth[j].width = Math.max(columnWidth[j].width, tableData[i][j].length + 2)
    }
  }

  tableData.forEach((r, i) => {
    const rs = indent + '|' + r.map((cell, j) => {
      const raw = ` ${cell + ' '.repeat(columnWidth[j].width)}`
      return raw.substring(0, columnWidth[j].width)
    }).join('|') + '|'
    result.push(rs)
    if (i === 0) {
      const cutOff = indent + '|' + columnWidth.map(({ width, align }) => {
        let raw = '-'.repeat(width - 2)
        switch (align) {
          case 'left':
            raw = `:${raw} `
            break
          case 'center':
            raw = `:${raw}:`
            break
          case 'right':
            raw = ` ${raw}:`
            break
          default:
            raw = ` ${raw} `
            break
        }
        return raw
      }).join('|') + '|'
      result.push(cutOff)
    }
  })
  return result.join('\n') + '\n'
}

export const normalizeList = function (block, indent, listIndent) {
  return this.translateBlocks2Markdown(block.children, indent, listIndent)
}

export const normalizeListItem = function (block, indent) {
  const result = []
  const listInfo = this.listType[this.listType.length - 1]
  const isUnorderedList = listInfo.type === 'ul'
  let { children, bulletMarkerOrDelimiter } = block
  let itemMarker

  if (isUnorderedList) {
    itemMarker = bulletMarkerOrDelimiter ? `${bulletMarkerOrDelimiter} ` : '- '
  } else {
    let n = listInfo.listCount
    if ((this.listIndentation === 'dfm' && n > 99) || n > 999999999) {
      n = 1
    }
    listInfo.listCount++

    const delimiter = bulletMarkerOrDelimiter || '.'
    itemMarker = `${n}${delimiter} `
  }

  const newIndent = indent + ' '.repeat(itemMarker.length)

  let listIndent = ''
  if (this.listIndentation === 'dfm') {
    listIndent = ' '.repeat(4 - itemMarker.length)
  } else if (this.listIndentation === 'number') {
    listIndent = ' '.repeat(this.listIndentationCount - 1)
  }

  if (isUnorderedList && block.listItemType === 'task') {
    const firstChild = children[0]
    itemMarker += firstChild.checked ? '[x] ' : '[ ] '
    children = children.slice(1)
  }

  result.push(`${indent}${itemMarker}`)
  result.push(this.translateBlocks2Markdown(children, newIndent, listIndent).substring(newIndent.length))
  return result.join('')
}

export const normalizeFootnote = function (block, indent) {
  const result = []
  const identifier = block.children[0].text
  result.push(`${indent}[^${identifier}]:`)
  const hasMultipleBlocks = block.children.length > 2 || block.children[1].type !== 'p'
  if (hasMultipleBlocks) {
    result.push('\n')
    const newIndent = indent + ' '.repeat(4)
    result.push(this.translateBlocks2Markdown(block.children.slice(1), newIndent))
  } else {
    result.push(' ')
    const paragraphContent = block.children[1].children[0]
    result.push(this.normalizeParagraphText(paragraphContent, indent))
  }

  return result.join('')
}
