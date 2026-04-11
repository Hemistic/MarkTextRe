import selection from '../selection'
import { getSanitizeHtml } from '../utils/sanitizeHtml'
import ExportMarkdown from '../utils/exportMarkdown'
import { getClipboardData } from './clipboardData'

const copyCutCtrl = ContentState => {
  ContentState.prototype.docCutHandler = function (event) {
    const { selectedTableCells } = this
    if (selectedTableCells) {
      event.preventDefault()
      return this.deleteSelectedTableCells(true)
    }
  }

  ContentState.prototype.cutHandler = function () {
    if (this.selectedTableCells) {
      return
    }
    const { selectedImage } = this
    if (selectedImage) {
      const { key, token } = selectedImage
      this.deleteImage({
        key,
        token
      })
      this.selectedImage = null
      return
    }
    const { start, end } = selection.getCursorRange()
    if (!start || !end) {
      return
    }
    const startBlock = this.getBlock(start.key)
    const endBlock = this.getBlock(end.key)
    startBlock.text = startBlock.text.substring(0, start.offset) + endBlock.text.substring(end.offset)
    if (start.key !== end.key) {
      this.removeBlocks(startBlock, endBlock)
    }
    this.cursor = {
      start,
      end: start
    }
    this.checkInlineUpdate(startBlock)
    this.partialRender()
  }

  ContentState.prototype.getClipBoardData = function () {
    return getClipboardData(this)
  }

  ContentState.prototype.docCopyHandler = function (event) {
    const { selectedTableCells } = this
    if (selectedTableCells) {
      event.preventDefault()
      const { row, column, cells } = selectedTableCells
      const tableContents = []
      let i
      let j
      for (i = 0; i < row; i++) {
        const rowWrapper = []
        for (j = 0; j < column; j++) {
          const cell = cells[i * column + j]

          rowWrapper.push({
            text: cell.text,
            align: cell.align
          })
        }
        tableContents.push(rowWrapper)
      }

      if (row === 1 && column === 1) {
        // Copy cells text if only one is selected
        if (tableContents[0][0].text.length > 0) {
          event.clipboardData.setData('text/html', '')
          event.clipboardData.setData('text/plain', tableContents[0][0].text)
        }
      } else {
        // Copy as markdown table
        const figureBlock = this.createBlock('figure', {
          functionType: 'table'
        })
        const table = this.createTableInFigure({ rows: row, columns: column }, tableContents)
        this.appendChild(figureBlock, table)
        const { isGitlabCompatibilityEnabled, listIndentation } = this
        const markdown = new ExportMarkdown([figureBlock], listIndentation, isGitlabCompatibilityEnabled).generate()
        if (markdown.length > 0) {
          event.clipboardData.setData('text/html', '')
          event.clipboardData.setData('text/plain', markdown)
        }
      }
    }
  }

  ContentState.prototype.copyHandler = function (event, type, copyInfo = null) {
    if (this.selectedTableCells) {
      // Hand over to docCopyHandler
      return
    }
    event.preventDefault()
    const { selectedImage } = this
    if (selectedImage) {
      const { token } = selectedImage
      if (token.raw.length > 0) {
        event.clipboardData.setData('text/html', token.raw)
        event.clipboardData.setData('text/plain', token.raw)
      }
      return
    }

    const { html, text } = this.getClipBoardData()
    switch (type) {
      case 'normal': {
        if (text.length > 0) {
          event.clipboardData.setData('text/html', html)
          event.clipboardData.setData('text/plain', text)
        }
        break
      }
      case 'copyAsMarkdown': {
        if (text.length > 0) {
          event.clipboardData.setData('text/html', '')
          event.clipboardData.setData('text/plain', text)
        }
        break
      }
      case 'copyAsHtml': {
        if (text.length > 0) {
          event.clipboardData.setData('text/html', '')
          event.clipboardData.setData('text/plain', getSanitizeHtml(text, {
            superSubScript: this.muya.options.superSubScript,
            footnote: this.muya.options.footnote,
            isGitlabCompatibilityEnabled: this.muya.options.isGitlabCompatibilityEnabled
          }))
        }
        break
      }

      case 'copyBlock': {
        const block = typeof copyInfo === 'string' ? this.getBlock(copyInfo) : copyInfo
        if (!block) return
        const anchor = this.getAnchor(block)
        const { isGitlabCompatibilityEnabled, listIndentation } = this
        const markdown = new ExportMarkdown([anchor], listIndentation, isGitlabCompatibilityEnabled).generate()
        if (markdown.length > 0) {
          event.clipboardData.setData('text/html', '')
          event.clipboardData.setData('text/plain', markdown)
        }
        break
      }

      case 'copyCodeContent': {
        const codeContent = copyInfo
        if (typeof codeContent !== 'string') {
          return
        }
        if (codeContent.length > 0) {
          event.clipboardData.setData('text/html', '')
          event.clipboardData.setData('text/plain', codeContent)
        }
      }
    }
  }
}

export default copyCutCtrl
