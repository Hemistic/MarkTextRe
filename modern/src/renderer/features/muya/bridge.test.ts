import { describe, expect, it, vi } from 'vitest'
vi.mock('./pluginRegistry', () => ({
  registerMuyaPlugins: vi.fn()
}))
import {
  ensureMuyaPluginSlots,
  getMuyaErrorMessage,
  resolveMuyaConstructor,
  syncMuyaEditorState
} from './bridge'

describe('muya bridge', () => {
  it('adds destroy stubs for legacy plugin slots that may be missing', () => {
    const editor = ensureMuyaPluginSlots({
      setMarkdown: vi.fn(),
      on: vi.fn()
    })

    expect(typeof editor.quickInsert).toBe('object')
    expect(typeof editor.codePicker).toBe('object')
    expect(typeof editor.tablePicker).toBe('object')
    expect(typeof editor.emojiPicker).toBe('object')
    expect(typeof editor.imagePathPicker).toBe('object')
  })

  it('restores markdown, cursor and history through the legacy editor api', () => {
    const setMarkdown = vi.fn()
    const setHistory = vi.fn()

    syncMuyaEditorState({
      setMarkdown,
      setHistory,
      on: vi.fn()
    }, '# Demo', { start: 1 }, { undo: [] })

    expect(setMarkdown).toHaveBeenCalledWith('# Demo', { start: 1 }, true)
    expect(setHistory).toHaveBeenCalledWith({ undo: [] })
  })

  it('normalizes unknown initialization errors into display text', () => {
    expect(getMuyaErrorMessage(new Error('boom'))).toBe('boom')
    expect(getMuyaErrorMessage('plain failure')).toBe('plain failure')
  })

  it('resolves nested default exports for legacy constructor interop', () => {
    const ctor = vi.fn() as unknown as new (...args: unknown[]) => unknown
    const resolved = resolveMuyaConstructor({
      default: {
        default: ctor
      }
    })

    expect(resolved).toBe(ctor)
  })

  it('throws when legacy constructor export is not a function', () => {
    expect(() => resolveMuyaConstructor({ default: { default: {} } })).toThrow('Legacy Muya constructor export is invalid.')
  })
})
