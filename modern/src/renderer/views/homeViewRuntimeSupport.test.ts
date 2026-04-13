import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { createHomeEditorCommandExecutor } from './homeViewRuntimeSupport'

describe('homeViewRuntimeSupport', () => {
  it('creates a command executor that delegates to search and the muya editor ref', async () => {
    const openSearchPanel = vi.fn(async () => {})
    const undo = vi.fn()
    const redo = vi.fn()
    const muyaEditor = ref({
      undo,
      redo
    } as any)

    const executor = createHomeEditorCommandExecutor({ openSearchPanel }, muyaEditor)

    await executor.openSearchPanel()
    executor.undo()
    executor.redo()

    expect(openSearchPanel).toHaveBeenCalledOnce()
    expect(undo).toHaveBeenCalledOnce()
    expect(redo).toHaveBeenCalledOnce()
  })
})
