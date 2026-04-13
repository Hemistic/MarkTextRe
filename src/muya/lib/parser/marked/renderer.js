import defaultOptions from './options'
import {
  frontmatter as renderFrontmatter,
  multiplemath as renderMultiplemath,
  footnoteIdentifier as renderFootnoteIdentifier,
  footnote as renderFootnote,
  footnoteItem as renderFootnoteItem,
  code as renderCode,
  blockquote as renderBlockquote,
  html as renderHtml,
  heading as renderHeading,
  hr as renderHr,
  list as renderList,
  listitem as renderListItem,
  paragraph as renderParagraph,
  table as renderTable,
  tablerow as renderTableRow,
  tablecell as renderTableCell,
  toc as renderToc
} from './rendererBlockSupport'
import {
  inlineMath as renderInlineMath,
  emoji as renderEmoji,
  script as renderScript,
  strong as renderStrong,
  em as renderEm,
  codespan as renderCodespan,
  br as renderBr,
  del as renderDel,
  link as renderLink,
  image as renderImage,
  text as renderText
} from './rendererInlineSupport'

/**
 * Renderer
 */

function Renderer (options = {}) {
  this.options = options || defaultOptions
}

Renderer.prototype.frontmatter = function (text) {
  return renderFrontmatter.call(this, text)
}

Renderer.prototype.multiplemath = function (text) {
  return renderMultiplemath.call(this, text)
}

Renderer.prototype.inlineMath = function (math) {
  return renderInlineMath.call(this, math)
}

Renderer.prototype.emoji = function (text, emoji) {
  return renderEmoji.call(this, text, emoji)
}

Renderer.prototype.script = function (content, marker) {
  return renderScript.call(this, content, marker)
}

Renderer.prototype.footnoteIdentifier = function (identifier, { footnoteId, footnoteIdentifierId, order }) {
  return renderFootnoteIdentifier.call(this, identifier, { footnoteId, footnoteIdentifierId, order })
}

Renderer.prototype.footnote = function (footnote) {
  return renderFootnote.call(this, footnote)
}

Renderer.prototype.footnoteItem = function (content, { footnoteId, footnoteIdentifierId }) {
  return renderFootnoteItem.call(this, content, { footnoteId, footnoteIdentifierId })
}

Renderer.prototype.code = function (code, infostring, escaped, codeBlockStyle) {
  return renderCode.call(this, code, infostring, escaped, codeBlockStyle)
}

Renderer.prototype.blockquote = function (quote) {
  return renderBlockquote.call(this, quote)
}

Renderer.prototype.html = function (html) {
  return renderHtml.call(this, html)
}

Renderer.prototype.heading = function (text, level, raw, slugger, headingStyle) {
  return renderHeading.call(this, text, level, raw, slugger, headingStyle)
}

Renderer.prototype.hr = function () {
  return renderHr.call(this)
}

Renderer.prototype.list = function (body, ordered, start, taskList) {
  return renderList.call(this, body, ordered, start, taskList)
}

Renderer.prototype.listitem = function (text, checked) {
  return renderListItem.call(this, text, checked)
}

Renderer.prototype.paragraph = function (text) {
  return renderParagraph.call(this, text)
}

Renderer.prototype.table = function (header, body) {
  return renderTable.call(this, header, body)
}

Renderer.prototype.tablerow = function (content) {
  return renderTableRow.call(this, content)
}

Renderer.prototype.tablecell = function (content, flags) {
  return renderTableCell.call(this, content, flags)
}

// span level renderer
Renderer.prototype.strong = function (text) {
  return renderStrong.call(this, text)
}

Renderer.prototype.em = function (text) {
  return renderEm.call(this, text)
}

Renderer.prototype.codespan = function (text) {
  return renderCodespan.call(this, text)
}

Renderer.prototype.br = function () {
  return renderBr.call(this)
}

Renderer.prototype.del = function (text) {
  return renderDel.call(this, text)
}

Renderer.prototype.link = function (href, title, text) {
  return renderLink.call(this, href, title, text)
}

Renderer.prototype.image = function (href, title, text) {
  return renderImage.call(this, href, title, text)
}

Renderer.prototype.text = function (text) {
  return renderText.call(this, text)
}

Renderer.prototype.toc = function () {
  return renderToc.call(this)
}

export default Renderer
