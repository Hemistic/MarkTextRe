import options from './options'
import { selectBlockRules } from './lexerSupport'
import { lex, token } from './lexerFlowSupport'

/**
 * Block Lexer
 */

function Lexer (opts) {
  this.tokens = []
  this.tokens.links = Object.create(null)
  this.tokens.footnotes = Object.create(null)
  this.footnoteOrder = 0
  this.options = Object.assign({}, options, opts)
  this.rules = selectBlockRules(this.options)
}

/**
 * Preprocessing
 */

Lexer.prototype.lex = function (src) {
  return lex(this, src)
}

/**
 * Lexing
 */

Lexer.prototype.token = function (src, top) {
  return token(this, src, top)
}

export default Lexer
