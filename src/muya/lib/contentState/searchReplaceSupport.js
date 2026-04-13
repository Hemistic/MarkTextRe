import { defaultSearchOption } from '../config'
import { buildRegexValue } from './searchRegexSupport'

export const replaceOne = (contentState, match, value) => {
  const { start, end, key } = match
  const block = contentState.getBlock(key)
  const { text } = block
  block.text = text.substring(0, start) + value + text.substring(end)
}

export const replaceMatches = (contentState, replaceValue, opt = { isSingle: true }) => {
  const { isSingle, isRegexp } = opt
  delete opt.isSingle
  const searchOptions = Object.assign({}, defaultSearchOption, opt)
  const { matches, value, index } = contentState.searchMatches
  if (matches.length) {
    if (isRegexp) {
      replaceValue = buildRegexValue(matches[index], replaceValue)
    }
    if (isSingle) {
      replaceOne(contentState, matches[index], replaceValue)
    } else {
      for (const match of matches) {
        replaceOne(contentState, match, replaceValue)
      }
    }
    const highlightIndex = index < matches.length - 1 ? index : index - 1
    contentState.search(value, { ...searchOptions, highlightIndex: isSingle ? highlightIndex : -1 })
  }
}
