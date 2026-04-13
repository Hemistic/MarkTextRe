import { HTML_TAGS, VOID_HTML_TAGS } from '../config'

export const parseSelector = (str = '') => {
  const REG_EXP = /(#|\.)([^#.]+)/
  let tag = ''
  let id = ''
  let className = ''
  let isVoid = false
  let cap
  for (const tagName of HTML_TAGS) {
    if (str.startsWith(tagName) && (!str[tagName.length] || /#|\./.test(str[tagName.length]))) {
      tag = tagName
      if (VOID_HTML_TAGS.indexOf(tagName) > -1) isVoid = true
      str = str.substring(tagName.length)
    }
  }
  if (tag !== '') {
    cap = REG_EXP.exec(str)
    while (cap && str.length) {
      if (cap[1] === '#') {
        id = cap[2]
      } else {
        className = cap[2]
      }
      str = str.substring(cap[0].length)
      cap = REG_EXP.exec(str)
    }
  }
  return { tag, id, className, isVoid }
}
