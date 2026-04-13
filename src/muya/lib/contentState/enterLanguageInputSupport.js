export const handleLanguageInputEnter = (contentState, block) => {
  if (!block || block.functionType !== 'languageInput') {
    return false
  }

  contentState.updateCodeLanguage(block, block.text.trim())
  return true
}
