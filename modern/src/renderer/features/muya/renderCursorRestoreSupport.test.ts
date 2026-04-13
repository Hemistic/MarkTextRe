import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../../../src/muya/lib/contentState/runtimeDomSupport', () => ({
  getContentStateEditor: vi.fn()
}))

vi.mock('../../../../../src/muya/lib/contentState/runtimeRenderAccessSupport', () => ({
  getContentStateStateRender: vi.fn((contentState: any) => contentState.stateRender ?? null),
  getStateRenderContainer: vi.fn((stateRender: any) => stateRender?.container ?? null)
}))

// @ts-ignore legacy Muya support test bridge is JS-backed on purpose.
import {
  applyResolvedRenderCursorAction,
  hasCursorBlocks,
  hasCursorEndpoints,
  normalizeCursorEndpoints,
  resolveRenderCursorAction,
  shouldRestoreContentCursor
} from './legacyRenderCursorRestoreTestApi'

// @ts-ignore legacy mocked JS module
import { getContentStateEditor } from '../../../../../src/muya/lib/contentState/runtimeDomSupport'

describe('muya renderCursorRestoreSupport', () => {
  it('requires full cursor endpoints before restore', () => {
    expect(hasCursorEndpoints(null)).toBe(false)
    expect(hasCursorEndpoints({ start: { key: 'a' } })).toBe(false)
    expect(hasCursorEndpoints({
      start: { key: 'a' },
      end: { key: 'a' }
    })).toBe(true)
    expect(hasCursorEndpoints({
      anchor: { key: 'a' },
      focus: { key: 'a' },
      start: { key: 'a' },
      end: { key: 'a' }
    })).toBe(true)
  })

  it('normalizes legacy collapsed cursors that only provide start/end', () => {
    expect(normalizeCursorEndpoints({
      start: { key: 'a', offset: 1 },
      end: { key: 'a', offset: 1 }
    })).toEqual({
      anchor: { key: 'a', offset: 1 },
      focus: { key: 'a', offset: 1 },
      start: { key: 'a', offset: 1 },
      end: { key: 'a', offset: 1 }
    })
  })

  it('checks that cursor blocks still exist', () => {
    const contentState = {
      cursor: {
        anchor: { key: 'a' },
        focus: { key: 'a' },
        start: { key: 'a' },
        end: { key: 'b' }
      },
      getBlock: vi.fn((key: string) => key === 'a' ? { key } : null)
    }

    expect(hasCursorBlocks(contentState)).toBe(false)
  })

  it('skips cursor restore when render/editor context is not stable', () => {
    const editor = {
      isConnected: true
    }
    const contentState = {
      cursor: {
        anchor: { key: 'a' },
        focus: { key: 'a' },
        start: { key: 'a' },
        end: { key: 'a' }
      },
      stateRender: {
        container: { isConnected: true }
      },
      getBlock: vi.fn(() => ({ key: 'a' }))
    }

    vi.mocked(getContentStateEditor).mockReturnValue(editor as any)
    expect(shouldRestoreContentCursor(contentState as any)).toBe(true)

    ;(contentState.stateRender as any).container = null
    expect(shouldRestoreContentCursor(contentState as any)).toBe(false)
  })

  it('resolves render cursor action into restore, blur or skip', () => {
    const contentState = {
      cursor: {
        anchor: { key: 'a' },
        focus: { key: 'a' },
        start: { key: 'a' },
        end: { key: 'a' }
      },
      stateRender: {
        container: { isConnected: true }
      },
      getBlock: vi.fn(() => ({ key: 'a' }))
    }
    const editor = {
      isConnected: true
    }

    vi.mocked(getContentStateEditor).mockReturnValue(editor as any)

    expect(resolveRenderCursorAction(contentState as any, true)).toBe('restore')
    expect(resolveRenderCursorAction(contentState as any, false)).toBe('blur')

    ;(contentState.stateRender as any).container = null
    expect(resolveRenderCursorAction(contentState as any, true)).toBe('skip')
  })

  it('keeps focus state unchanged when cursor restore fails after render', () => {
    const contentState = { cursor: {} }
    const restoreCursor = vi.fn(() => false)
    const blurContentState = vi.fn()

    expect(applyResolvedRenderCursorAction(contentState, 'restore', restoreCursor, blurContentState)).toBe('skip')
    expect(restoreCursor).toHaveBeenCalledWith(contentState)
    expect(blurContentState).not.toHaveBeenCalled()
  })

  it('does not blur when restore succeeds or action is skip', () => {
    const contentState = { cursor: {} }
    const restoreCursor = vi.fn(() => true)
    const blurContentState = vi.fn()

    expect(applyResolvedRenderCursorAction(contentState, 'restore', restoreCursor, blurContentState)).toBe('restore')
    expect(applyResolvedRenderCursorAction(contentState, 'skip', restoreCursor, blurContentState)).toBe('skip')
    expect(blurContentState).not.toHaveBeenCalled()
  })
})
