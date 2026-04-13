import { describe, expect, it, vi } from 'vitest'
import { bindMuyaEditorChange, createMuyaEditorInstance, waitForMuyaEditorReady } from './editorLifecycle'

describe('editorLifecycle', () => {
  it('creates a legacy muya instance with default options and plugin slots', () => {
    const host = {} as HTMLElement
    const constructorSpy = vi.fn()
    class FakeMuya {
      options: Record<string, unknown>
      setMarkdown = vi.fn()
      on = vi.fn()

      constructor (_host: HTMLElement, options: Record<string, unknown>) {
        constructorSpy(_host, options)
        this.options = options
      }
    }

    const editor = createMuyaEditorInstance(FakeMuya as any, host, '# Demo')

    expect(constructorSpy).toHaveBeenCalledWith(host, expect.objectContaining({
      markdown: '# Demo',
      focusMode: false,
      hideQuickInsertHint: false,
      footnote: false
    }))
    expect(typeof editor.quickInsert).toBe('object')
    expect(typeof editor.codePicker).toBe('object')
  })

  it('waits for legacy ready hooks before returning the editor', async () => {
    const ready = Promise.resolve()
    const editor = {
      ready,
      setMarkdown: vi.fn(),
      on: vi.fn()
    }

    await expect(waitForMuyaEditorReady(editor)).resolves.toBe(editor)
  })

  it('binds change handlers through the legacy event api', () => {
    const on = vi.fn()
    const handler = vi.fn()
    const editor = {
      setMarkdown: vi.fn(),
      on
    }

    expect(bindMuyaEditorChange(editor, handler)).toBe(editor)
    expect(on).toHaveBeenCalledWith('change', handler)
  })
})
