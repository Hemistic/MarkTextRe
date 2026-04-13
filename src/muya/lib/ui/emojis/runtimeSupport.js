let emojiModulePromise = null
let emojiModuleCache = null

const loadEmojiModule = async () => {
  if (emojiModuleCache) {
    return emojiModuleCache
  }

  if (!emojiModulePromise) {
    emojiModulePromise = import('./index').then(module => {
      emojiModuleCache = module
      return module
    })
  }

  return emojiModulePromise
}

export const getCachedEmojiModule = () => emojiModuleCache

export const ensureEmojiModule = async () => loadEmojiModule()

export const createEmojiSearch = async () => {
  const { default: Emoji } = await loadEmojiModule()
  return new Emoji()
}
