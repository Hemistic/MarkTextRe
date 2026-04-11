import { Lexer } from '../parser/marked'
import { loadLanguage } from '../prism/index'

const languageLoaded = new Set()

export const markdownToState = (contentState, markdown) => {
  const rootState = {
    key: null,
    type: 'root',
    text: '',
    parent: null,
    preSibling: null,
    nextSibling: null,
    children: []
  }
  const {
    footnote,
    isGitlabCompatibilityEnabled,
    superSubScript,
    trimUnnecessaryCodeBlockEmptyLines
  } = contentState.muya.options

  const tokens = new Lexer({
    disableInline: true,
    footnote,
    isGitlabCompatibilityEnabled,
    superSubScript
  }).lex(markdown)

  let token
  let block
  let value
  const parentList = [rootState]

  while ((token = tokens.shift())) {
    switch (token.type) {
      case 'frontmatter': {
        const { lang, style } = token
        value = token.text
          .replace(/^\s+/, '')
          .replace(/\s$/, '')
        block = contentState.createBlock('pre', {
          functionType: token.type,
          lang,
          style
        })

        const codeBlock = contentState.createBlock('code', {
          lang
        })

        const codeContent = contentState.createBlock('span', {
          text: value,
          lang,
          functionType: 'codeContent'
        })

        contentState.appendChild(codeBlock, codeContent)
        contentState.appendChild(block, codeBlock)
        contentState.appendChild(parentList[0], block)
        break
      }

      case 'hr': {
        value = token.marker
        block = contentState.createBlock('hr')
        const thematicBreakContent = contentState.createBlock('span', {
          text: value,
          functionType: 'thematicBreakLine'
        })
        contentState.appendChild(block, thematicBreakContent)
        contentState.appendChild(parentList[0], block)
        break
      }

      case 'heading': {
        const { headingStyle, depth, text, marker } = token
        value = headingStyle === 'atx' ? '#'.repeat(+depth) + ` ${text}` : text
        block = contentState.createBlock(`h${depth}`, {
          headingStyle
        })

        const headingContent = contentState.createBlock('span', {
          text: value,
          functionType: headingStyle === 'atx' ? 'atxLine' : 'paragraphContent'
        })

        contentState.appendChild(block, headingContent)

        if (marker) {
          block.marker = marker
        }

        contentState.appendChild(parentList[0], block)
        break
      }

      case 'multiplemath': {
        value = token.text
        block = contentState.createContainerBlock(token.type, value, token.mathStyle)
        contentState.appendChild(parentList[0], block)
        break
      }

      case 'code': {
        const { codeBlockStyle, text, lang: infostring = '' } = token
        const lang = (infostring || '').match(/\S*/)[0]

        value = text
        if (trimUnnecessaryCodeBlockEmptyLines && (value.endsWith('\n') || value.startsWith('\n'))) {
          value = value.replace(/\n+$/, '')
            .replace(/^\n+/, '')
        }
        if (/mermaid|flowchart|vega-lite|sequence|plantuml/.test(lang)) {
          block = contentState.createContainerBlock(lang, value)
          contentState.appendChild(parentList[0], block)
        } else {
          block = contentState.createBlock('pre', {
            functionType: codeBlockStyle === 'fenced' ? 'fencecode' : 'indentcode',
            lang
          })
          const codeBlock = contentState.createBlock('code', {
            lang
          })
          const codeContent = contentState.createBlock('span', {
            text: value,
            lang,
            functionType: 'codeContent'
          })
          const inputBlock = contentState.createBlock('span', {
            text: lang,
            functionType: 'languageInput'
          })
          if (lang && !languageLoaded.has(lang)) {
            languageLoaded.add(lang)
            loadLanguage(lang)
              .then(infoList => {
                if (!Array.isArray(infoList)) return
                const needRender = infoList.some(({ status }) => status === 'loaded')
                if (needRender) {
                  contentState.render()
                }
              })
              .catch(err => {
                console.warn(err)
              })
          }

          contentState.appendChild(codeBlock, codeContent)
          contentState.appendChild(block, inputBlock)
          contentState.appendChild(block, codeBlock)
          contentState.appendChild(parentList[0], block)
        }
        break
      }

      case 'table': {
        const { header, align, cells } = token
        const table = contentState.createBlock('table')
        const thead = contentState.createBlock('thead')
        const tbody = contentState.createBlock('tbody')
        const theadRow = contentState.createBlock('tr')
        const restoreTableEscapeCharacters = text => text.replace(/\|/g, '\\|')
        let i
        let j
        const headerLen = header.length
        for (i = 0; i < headerLen; i++) {
          const headText = header[i]
          const th = contentState.createBlock('th', {
            align: align[i] || '',
            column: i
          })
          const cellContent = contentState.createBlock('span', {
            text: restoreTableEscapeCharacters(headText),
            functionType: 'cellContent'
          })
          contentState.appendChild(th, cellContent)
          contentState.appendChild(theadRow, th)
        }
        const rowLen = cells.length
        for (i = 0; i < rowLen; i++) {
          const rowBlock = contentState.createBlock('tr')
          const rowContents = cells[i]
          const colLen = rowContents.length
          for (j = 0; j < colLen; j++) {
            const cell = rowContents[j]
            const td = contentState.createBlock('td', {
              align: align[j] || '',
              column: j
            })
            const cellContent = contentState.createBlock('span', {
              text: restoreTableEscapeCharacters(cell),
              functionType: 'cellContent'
            })

            contentState.appendChild(td, cellContent)
            contentState.appendChild(rowBlock, td)
          }
          contentState.appendChild(tbody, rowBlock)
        }

        Object.assign(table, { row: cells.length, column: header.length - 1 })
        block = contentState.createBlock('figure')
        block.functionType = 'table'
        contentState.appendChild(thead, theadRow)
        contentState.appendChild(block, table)
        contentState.appendChild(table, thead)
        if (tbody.children.length) {
          contentState.appendChild(table, tbody)
        }
        contentState.appendChild(parentList[0], block)
        break
      }

      case 'html': {
        const text = token.text.trim()
        const isSingleImage = /^<img[^<>]+>$/.test(text)
        if (isSingleImage) {
          block = contentState.createBlock('p')
          const contentBlock = contentState.createBlock('span', {
            text
          })
          contentState.appendChild(block, contentBlock)
          contentState.appendChild(parentList[0], block)
        } else {
          block = contentState.createHtmlBlock(text)
          contentState.appendChild(parentList[0], block)
        }
        break
      }

      case 'text': {
        value = token.text
        while (tokens[0].type === 'text') {
          token = tokens.shift()
          value += `\n${token.text}`
        }
        block = contentState.createBlock('p')
        const contentBlock = contentState.createBlock('span', {
          text: value
        })
        contentState.appendChild(block, contentBlock)
        contentState.appendChild(parentList[0], block)
        break
      }

      case 'toc':
      case 'paragraph': {
        value = token.text
        block = contentState.createBlock('p')
        const contentBlock = contentState.createBlock('span', {
          text: value
        })
        contentState.appendChild(block, contentBlock)
        contentState.appendChild(parentList[0], block)
        break
      }

      case 'blockquote_start': {
        block = contentState.createBlock('blockquote')
        contentState.appendChild(parentList[0], block)
        parentList.unshift(block)
        break
      }

      case 'blockquote_end': {
        if (parentList[0].children.length === 0) {
          const paragraphBlock = contentState.createBlockP()
          contentState.appendChild(parentList[0], paragraphBlock)
        }
        parentList.shift()
        break
      }

      case 'footnote_start': {
        block = contentState.createBlock('figure', {
          functionType: 'footnote'
        })
        const identifierInput = contentState.createBlock('span', {
          text: token.identifier,
          functionType: 'footnoteInput'
        })
        contentState.appendChild(block, identifierInput)
        contentState.appendChild(parentList[0], block)
        parentList.unshift(block)
        break
      }

      case 'footnote_end': {
        parentList.shift()
        break
      }

      case 'list_start': {
        const { ordered, listType, start } = token
        block = contentState.createBlock(ordered === true ? 'ol' : 'ul')
        block.listType = listType
        if (listType === 'order') {
          block.start = /^\d+$/.test(start) ? start : 1
        }
        contentState.appendChild(parentList[0], block)
        parentList.unshift(block)
        break
      }

      case 'list_end': {
        parentList.shift()
        break
      }

      case 'loose_item_start':
      case 'list_item_start': {
        const { listItemType, bulletMarkerOrDelimiter, checked, type } = token
        block = contentState.createBlock('li', {
          listItemType: checked !== undefined ? 'task' : listItemType,
          bulletMarkerOrDelimiter,
          isLooseListItem: type === 'loose_item_start'
        })

        if (checked !== undefined) {
          const input = contentState.createBlock('input', {
            checked
          })

          contentState.appendChild(block, input)
        }
        contentState.appendChild(parentList[0], block)
        parentList.unshift(block)
        break
      }

      case 'list_item_end': {
        parentList.shift()
        break
      }

      case 'space': {
        break
      }

      default:
        console.warn(`Unknown type ${token.type}`)
        break
    }
  }

  return rootState.children.length ? rootState.children : [contentState.createBlockP()]
}

export const importMarkdown = (contentState, markdown) => {
  contentState.blocks = markdownToState(contentState, markdown)
}
