import {
  checkEditLanguage,
  selectLanguage,
  updateCodeLanguage,
  codeBlockUpdate,
  copyCodeBlock
} from './codeBlockSupport'

const codeBlockCtrl = ContentState => {
  /**
  * check edit language
  */
  ContentState.prototype.checkEditLanguage = function () {
    return checkEditLanguage(this)
  }

  ContentState.prototype.selectLanguage = function (paragraph, lang) {
    return selectLanguage(this, paragraph, lang)
  }

  /**
   * Update the code block language or creates a new code block.
   *
   * @param block Language-input block or paragraph
   * @param lang Language identifier
   */
  ContentState.prototype.updateCodeLanguage = function (block, lang) {
    return updateCodeLanguage(this, block, lang)
  }

  /**
   * [codeBlockUpdate if block updated to `pre` return true, else return false]
   */
  ContentState.prototype.codeBlockUpdate = function (block, code = '', lang) {
    return codeBlockUpdate(this, block, code, lang)
  }

  /**
   * Copy the code block by click right-top copy icon in code block.
   */
  ContentState.prototype.copyCodeBlock = function (event) {
    return copyCodeBlock(this, event)
  }

  ContentState.prototype.resizeLineNumber = function () {
    // FIXME: Disabled due to #1648.
    // const { codeBlockLineNumbers } = this.muya.options
    // if (!codeBlockLineNumbers) {
    //   return
    // }

    // const codeBlocks = document.querySelectorAll('pre.line-numbers')
    // if (codeBlocks.length) {
    //   for (const ele of codeBlocks) {
    //     resizeCodeBlockLineNumber(ele)
    //   }
    // }
  }
}

export default codeBlockCtrl
