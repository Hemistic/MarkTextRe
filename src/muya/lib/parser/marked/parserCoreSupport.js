import InlineLexer from './inlineLexer'
import TextRenderer from './textRenderer'

export function parse (src) {
  this.inline = new InlineLexer(src.links, src.footnotes, this.options)
  this.inlineText = new InlineLexer(
    src.links,
    src.footnotes,
    Object.assign({}, this.options, { renderer: new TextRenderer() })
  )
  this.tokens = src.reverse()
  this.footnotes = src.footnotes
  let out = ''
  while (this.next()) {
    out += this.tok()
  }

  return out
}

export function next () {
  this.token = this.tokens.pop()
  return this.token
}

export function peek () {
  return this.tokens[this.tokens.length - 1] || 0
}

export function parseText () {
  let body = this.token.text

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text
  }

  return this.inline.output(body)
}
