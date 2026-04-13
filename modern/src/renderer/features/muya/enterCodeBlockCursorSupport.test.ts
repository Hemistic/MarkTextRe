import { describe, expect, it, vi } from 'vitest'
// @ts-ignore legacy Muya support test bridge is JS-backed on purpose.
import {
  isCursorWithinBlock,
  resolveEnterCursorTarget,
  resolveHtmlEnterOffset,
  shouldPreserveCodeBlockEnterCursor
} from './legacyEnterSupportTestApi'

describe('muya enterCodeBlockCursorSupport', () => {
  it('resolves fenced code enter target to the code content block', () => {
    const codeContent = { key: 'code-content', type: 'span', children: [] }
    const codeBlock = { key: 'code', type: 'code', children: [codeContent] }
    const preBlock = { key: 'pre', type: 'pre', children: [{ key: 'lang', type: 'span' }, codeBlock] }

    expect(resolveEnterCursorTarget(preBlock)).toBe(codeContent)
  })

  it('detects when the current cursor is already inside the converted code block', () => {
    const preBlock = { key: 'pre', type: 'pre' }
    const codeBlock = { key: 'code', type: 'code' }
    const codeContent = { key: 'code-content', type: 'span' }
    const getBlock = vi.fn((key: string) => {
      return {
        pre: preBlock,
        code: codeBlock,
        'code-content': codeContent
      }[key] ?? null
    })
    const getParents = vi.fn((block: { key: string }) => {
      if (block.key === 'code-content') return [codeContent, codeBlock, preBlock]
      if (block.key === 'code') return [codeBlock, preBlock]
      return [preBlock]
    })
    const contentState = {
      cursor: {
        start: { key: 'code-content', offset: 0 }
      },
      getBlock,
      getParents
    }

    expect(isCursorWithinBlock(contentState, preBlock)).toBe(true)
    expect(shouldPreserveCodeBlockEnterCursor(contentState, true, preBlock, (block: unknown) => block)).toBe(true)
  })

  it('computes html enter offset from the first content line', () => {
    expect(resolveHtmlEnterOffset({ text: '<div>\nhello' })).toBe(11)
    expect(resolveHtmlEnterOffset({ text: '' })).toBe(0)
  })
})
