import { describe, expect, it, vi } from 'vitest'
import { createEditorRuntimeState } from './runtimeState'

describe('runtimeState', () => {
  it('wires the recent document refresher through injected runtime services', async () => {
    const fetchRecentDocuments = vi.fn(async () => ([
      {
        filename: 'notes.md',
        pathname: 'D:/docs/notes.md'
      }
    ]))

    const state = createEditorRuntimeState({
      fetchRecentDocuments
    })

    await state.refreshRecentDocuments()

    expect(fetchRecentDocuments).toHaveBeenCalledOnce()
    expect(state.recentDocuments.value).toEqual([{
      filename: 'notes.md',
      pathname: 'D:/docs/notes.md'
    }])
  })
})
