import {
  buildRegexValue,
  findInSearchMatches,
  replaceMatches,
  replaceOne,
  searchInContent,
  setCursorToHighlight
} from './searchSupport'

const searchCtrl = ContentState => {
  ContentState.prototype.buildRegexValue = function (match, value) {
    return buildRegexValue(match, value)
  }

  ContentState.prototype.replaceOne = function (match, value) {
    return replaceOne(this, match, value)
  }

  ContentState.prototype.replace = function (replaceValue, opt = { isSingle: true }) {
    return replaceMatches(this, replaceValue, opt)
  }

  ContentState.prototype.setCursorToHighlight = function () {
    return setCursorToHighlight(this)
  }

  ContentState.prototype.find = function (action/* prev next */) {
    return findInSearchMatches(this, action)
  }

  ContentState.prototype.search = function (value, opt = {}) {
    return searchInContent(this, value, opt)
  }
}

export default searchCtrl
