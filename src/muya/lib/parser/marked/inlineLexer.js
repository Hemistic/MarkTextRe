import Renderer from './renderer'
import defaultOptions from './options'
import {
  selectInlineRules,
  createHighPriorityRules,
  escapes,
  outputLink,
  smartypants,
  mangle
} from './inlineLexerSupport'
import { output } from './inlineLexerFlowSupport'

/**
 * Inline Lexer & Compiler
 */

function InlineLexer (links, footnotes, options) {
  this.options = options || defaultOptions
  this.links = links
  this.footnotes = footnotes
  this.rules = selectInlineRules(this.options)
  this.renderer = this.options.renderer || new Renderer()
  this.renderer.options = this.options

  if (!this.links) {
    throw new Error('Tokens array requires a `links` property.')
  }

  const { highPriorityEmpRules, highPriorityLinkRules } = createHighPriorityRules(this.rules)
  this.highPriorityEmpRules = highPriorityEmpRules
  this.highPriorityLinkRules = highPriorityLinkRules
}

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function (src) {
  return output(this, src)
}

InlineLexer.prototype.escapes = function (text) {
  return escapes(text, this.rules)
}

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function (cap, link) {
  return outputLink(this, cap, link)
}

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function (text) {
  return smartypants(text, this.options)
}

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function (text) {
  return mangle(text, this.options)
}

export default InlineLexer
