import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../../../src/muya/lib/selection/root', () => ({
  getSelectionRoot: vi.fn()
}))

vi.mock('../../../../../src/muya/lib/contentState/runtimeDomSupport', () => ({
  getContentStateEditor: vi.fn()
}))

vi.mock('../../../../../src/muya/lib/contentState/runtimeRenderAccessSupport', () => ({
  getContentStateStateRender: vi.fn((contentState: any) => contentState.stateRender ?? null),
  getStateRenderContainer: vi.fn((stateRender: any) => stateRender?.container ?? null)
}))

// @ts-ignore legacy Muya support test bridge is JS-backed on purpose.
import {
  hasCursorBlocks,
  hasCursorEndpoints,
  isSelectionRootCompatible,
  resolveRenderCursorAction,
  shouldRestoreContentCursor
} from './legacyRenderCursorRestoreTestApi'

// @ts-ignore legacy mocked JS module
import { getSelectionRoot } from '../../../../../src/muya/lib/selection/root'
// @ts-ignore legacy mocked JS module
import { getContentStateEditor } from '../../../../../src/muya/lib/contentState/runtimeDomSupport'

describe('muya renderCursorRestoreSupport', () => {
  it('requires full cursor endpoints before restore', () => {
    expect(hasCursorEndpoints(null)).toBe(false)
    expect(hasCursorEndpoints({ start: { key: 'a' } })).toBe(false)
    expect(hasCursorEndpoints({
      anchor: { key: 'a' },
      focus: { key: 'a' },
      start: { key: 'a' },
      end: { key: 'a' }
    })).toBe(true)
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

  it('accepts document roots and editor-contained roots', () => {
    const editor = {
      contains: vi.fn((node: unknown) => node === child)
    }
    const child = { nodeType: 1 }

    expect(isSelectionRootCompatible({ nodeType: 9 }, editor)).toBe(true)
    expect(isSelectionRootCompatible(child, editor)).toBe(true)
    expect(isSelectionRootCompatible({ nodeType: 1 }, editor)).toBe(false)
  })

  it('skips cursor restore when render/editor/root context is not stable', () => {
    const editor = {
      isConnected: true,
      contains: vi.fn(() => false)
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
    vi.mocked(getSelectionRoot).mockReturnValue({ nodeType: 1 } as any)
    expect(shouldRestoreContentCursor(contentState as any)).toBe(false)

    vi.mocked(getSelectionRoot).mockReturnValue({ nodeType: 9 } as any)
    expect(shouldRestoreContentCursor(contentState as any)).toBe(true)
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
      isConnected: true,
      contains: vi.fn(() => true)
    }

    vi.mocked(getContentStateEditor).mockReturnValue(editor as any)
    vi.mocked(getSelectionRoot).mockReturnValue({ nodeType: 9 } as any)

    expect(resolveRenderCursorAction(contentState as any, true)).toBe('restore')
    expect(resolveRenderCursorAction(contentState as any, false)).toBe('blur')

    vi.mocked(getSelectionRoot).mockReturnValue({ nodeType: 1 } as any)
    expect(resolveRenderCursorAction(contentState as any, true)).toBe('skip')
  })
})
