import { describe, expect, it } from 'vitest'
import { createDefaultMuyaEditorOptions, resolveDiagramThemes } from './editorOptions'

describe('createDefaultMuyaEditorOptions', () => {
  it('returns the expected editor settings', async () => {
    const options = createDefaultMuyaEditorOptions()

    expect(options.focusMode).toBe(false)
    expect(options.hideQuickInsertHint).toBe(false)
    expect(options.hideLinkPopup).toBe(false)
    expect(options.autoCheck).toBe(false)
    expect(options.spellcheckEnabled).toBe(false)
    expect(options.disableHtml).toBe(false)
    expect(options.footnote).toBe(false)
    expect(options.superSubScript).toBe(false)
    expect(options.preferLooseListItem).toBe(true)
    expect(options.bulletListMarker).toBe('-')
    expect(options.orderListDelimiter).toBe('.')
    expect(options.frontmatterType).toBe('-')
    expect(options.sequenceTheme).toBe('hand')
    expect(options.trimUnnecessaryCodeBlockEmptyLines).toBe(true)
    expect(options.isGitlabCompatibilityEnabled).toBe(false)
    expect(options.mermaidTheme).toBe('default')
    expect(options.vegaTheme).toBe('latimes')
    await expect(options.imagePathPicker()).resolves.toBeNull()
    expect(typeof options.imagePathAutoComplete).toBe('function')
    expect(options.imagePathAutoComplete()).toEqual([])
    expect(typeof options.clipboardFilePath).toBe('function')
    expect(options.clipboardFilePath()).toBeUndefined()
  })

  it('derives dark diagram themes from dark editor themes', () => {
    expect(resolveDiagramThemes('dark')).toEqual({
      mermaidTheme: 'dark',
      vegaTheme: 'dark'
    })
    expect(resolveDiagramThemes('one-dark')).toEqual({
      mermaidTheme: 'dark',
      vegaTheme: 'dark'
    })
    expect(resolveDiagramThemes('light')).toEqual({
      mermaidTheme: 'default',
      vegaTheme: 'latimes'
    })
  })
})
