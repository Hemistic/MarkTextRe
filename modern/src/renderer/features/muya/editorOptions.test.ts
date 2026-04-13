import { describe, expect, it } from 'vitest'
import { createDefaultMuyaEditorOptions } from './editorOptions'

describe('createDefaultMuyaEditorOptions', () => {
  it('returns the expected editor settings', () => {
    const options = createDefaultMuyaEditorOptions()

    expect(options.focusMode).toBe(false)
    expect(options.hideQuickInsertHint).toBe(true)
    expect(options.spellcheckEnabled).toBe(false)
    expect(options.disableHtml).toBe(false)
    expect(typeof options.imagePathAutoComplete).toBe('function')
    expect(options.imagePathAutoComplete()).toEqual([])
    expect(typeof options.clipboardFilePath).toBe('function')
    expect(options.clipboardFilePath()).toBeUndefined()
  })
})
