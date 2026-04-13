const renderTable = parser => {
  let header = ''
  let body = ''
  let i
  let row
  let cell
  let j

  cell = ''
  for (i = 0; i < parser.token.header.length; i++) {
    cell += parser.renderer.tablecell(
      parser.inline.output(parser.token.header[i]), {
        header: true,
        align: parser.token.align[i]
      }
    )
  }
  header += parser.renderer.tablerow(cell)

  for (i = 0; i < parser.token.cells.length; i++) {
    row = parser.token.cells[i]

    cell = ''
    for (j = 0; j < row.length; j++) {
      cell += parser.renderer.tablecell(
        parser.inline.output(row[j]), {
          header: false,
          align: parser.token.align[j]
        }
      )
    }

    body += parser.renderer.tablerow(cell)
  }
  return parser.renderer.table(header, body)
}

const renderBlockquote = parser => {
  let body = ''

  while (parser.next().type !== 'blockquote_end') {
    body += parser.tok()
  }

  return parser.renderer.blockquote(body)
}

const renderFootnote = parser => {
  let body = ''
  let itemBody = ''
  parser.footnoteIdentifier = parser.token.identifier
  while (parser.next()) {
    if (parser.token.type === 'footnote_end') {
      const footnoteInfo = parser.footnotes[parser.footnoteIdentifier]
      body += parser.renderer.footnoteItem(itemBody, footnoteInfo)
      parser.footnoteIdentifier = ''
      itemBody = ''
    } else if (parser.token.type === 'footnote_start') {
      parser.footnoteIdentifier = parser.token.identifier
      itemBody = ''
    } else {
      itemBody += parser.tok()
    }
  }
  return parser.renderer.footnote(body)
}

const renderList = parser => {
  let body = ''
  let taskList = false
  const { ordered, start } = parser.token

  while (parser.next().type !== 'list_end') {
    if (parser.token.checked !== undefined) {
      taskList = true
    }

    body += parser.tok()
  }

  return parser.renderer.list(body, ordered, start, taskList)
}

const renderListItem = (parser, loose) => {
  let body = ''
  const { checked } = parser.token

  while (parser.next().type !== 'list_item_end') {
    body += !loose && parser.token.type === 'text' ? parser.parseText() : parser.tok()
  }

  return parser.renderer.listitem(body, checked)
}

export function tok () {
  switch (this.token.type) {
    case 'frontmatter': {
      return this.renderer.frontmatter(this.token.text)
    }
    case 'space': {
      return ''
    }
    case 'hr': {
      return this.renderer.hr()
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        unescape(this.inlineText.output(this.token.text)),
        this.slugger,
        this.token.headingStyle
      )
    }
    case 'multiplemath': {
      const { text } = this.token
      return this.renderer.multiplemath(text)
    }
    case 'code': {
      const { codeBlockStyle, text, lang, escaped } = this.token
      return this.renderer.code(text, lang, escaped, codeBlockStyle)
    }
    case 'table': {
      return renderTable(this)
    }
    case 'blockquote_start': {
      return renderBlockquote(this)
    }
    case 'footnote_start': {
      return renderFootnote(this)
    }
    case 'list_start': {
      return renderList(this)
    }
    case 'list_item_start': {
      return renderListItem(this, false)
    }
    case 'loose_item_start': {
      return renderListItem(this, true)
    }
    case 'html': {
      return this.renderer.html(this.token.text)
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text))
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText())
    }
    case 'toc': {
      return this.renderer.toc()
    }
    default: {
      const errMsg = 'Token with "' + this.token.type + '" type was not found.'
      if (this.options.silent) {
        console.error(errMsg)
      } else {
        throw new Error(errMsg)
      }
    }
  }
}
