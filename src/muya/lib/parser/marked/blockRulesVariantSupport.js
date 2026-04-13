import { edit, noop } from './utils'

export const createGfmRules = block => {
  const gfm = Object.assign({}, block, {
    nptable: '^ *([^|\\n ].*\\|.*)\\n' +
      ' {0,3}([-:]+ *\\|[-| :]*)' +
      '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)',
    table: '^ *\\|(.+)\\n' +
      ' {0,3}\\|?( *[-:]+[-| :]*)' +
      '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)'
  })

  gfm.nptable = edit(gfm.nptable)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} ')
    .replace('blockquote', ' {0,3}>')
    .replace('code', ' {4}[^\\n]')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ')
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
    .replace('tag', block._tag)
    .getRegex()

  gfm.table = edit(gfm.table)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} ')
    .replace('blockquote', ' {0,3}>')
    .replace('code', ' {4}[^\\n]')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ')
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
    .replace('tag', block._tag)
    .getRegex()

  return gfm
}

export const createPedanticRules = normal => {
  return Object.assign({}, normal, {
    html: edit(
      '^ *(?:comment *(?:\\n|\\s*$)' +
      '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' +
      '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
      .replace('comment', normal._comment)
      .replace(/tag/g, '(?!(?:' +
        'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' +
        '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' +
        '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
      .getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: noop,
    paragraph: edit(normal._paragraph)
      .replace('hr', normal.hr)
      .replace('heading', ' *#{1,6} *[^\n]')
      .replace('lheading', normal.lheading)
      .replace('blockquote', ' {0,3}>')
      .replace('|fences', '')
      .replace('|list', '')
      .replace('|html', '')
      .getRegex()
  })
}
