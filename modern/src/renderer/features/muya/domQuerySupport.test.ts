import { describe, expect, it, vi } from 'vitest'
import {
  matchesSelector,
  queryFromRoot,
  resolveConnectedNode
} from './legacySupportTestApi'

describe('muya domQuerySupport', () => {
  it('returns the root when it matches the selector', () => {
    const root = {
      nodeType: 1,
      matches: vi.fn().mockReturnValue(true)
    }

    expect(queryFromRoot(root, '.ag-editor')).toBe(root)
    expect(matchesSelector(root, '.ag-editor')).toBe(true)
  })

  it('queries descendants when the root itself does not match', () => {
    const child = { id: 'child' }
    const root = {
      nodeType: 1,
      matches: vi.fn().mockReturnValue(false),
      querySelector: vi.fn().mockReturnValue(child)
    }

    expect(queryFromRoot(root, '.ag-editor')).toBe(child)
    expect(root.querySelector).toHaveBeenCalledWith('.ag-editor')
  })

  it('falls back to the provided root when the primary root cannot query', () => {
    const fallbackNode = { id: 'fallback' }
    const fallbackRoot = {
      querySelector: vi.fn().mockReturnValue(fallbackNode)
    }

    expect(queryFromRoot(null, '.ag-editor', fallbackRoot)).toBe(fallbackNode)
    expect(fallbackRoot.querySelector).toHaveBeenCalledWith('.ag-editor')
  })

  it('normalizes disconnected nodes to the global document placeholder', () => {
    const disconnected = {
      nodeType: 1,
      isConnected: false
    }

    expect(resolveConnectedNode(disconnected)).toBe(null)
  })
})
