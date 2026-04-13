import Renderer from './renderer'
import Slugger from './slugger'
import defaultOptions from './options'
import { parse, next, peek, parseText } from './parserCoreSupport'
import { tok } from './parserTokenSupport'

/**
 * Parsing & Compiling
 */

function Parser (options) {
  this.tokens = []
  this.token = null
  this.footnotes = null
  this.footnoteIdentifier = ''
  this.options = options || defaultOptions
  this.options.renderer = this.options.renderer || new Renderer()
  this.renderer = this.options.renderer
  this.renderer.options = this.options
  this.slugger = new Slugger()
}

/**
 * Parse Loop
 */

Parser.prototype.parse = function (src) {
  return parse.call(this, src)
}

/**
 * Next Token
 */

Parser.prototype.next = function () {
  return next.call(this)
}

/**
 * Preview Next Token
 */

Parser.prototype.peek = function () {
  return peek.call(this)
}

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function () {
  return parseText.call(this)
}

/**
 * Parse Current Token
 */

Parser.prototype.tok = function () {
  return tok.call(this)
}

export default Parser
