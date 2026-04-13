import { describe, expect, it } from 'vitest'
import { createCloseRequestRegistry } from './close-request-registry'

describe('close request registry', () => {
  it('starts requests and resolves matching responses', async () => {
    const registry = createCloseRequestRegistry({
      createRequestId: () => 'req-1'
    })
    const sentRequests: Array<{ requestId: string, kind: 'get-dirty-documents' | 'save-all-dirty-documents' }> = []

    const pending = registry.beginRequest(3, 'get-dirty-documents', request => {
      sentRequests.push(request)
    })

    expect(sentRequests).toEqual([{
      requestId: 'req-1',
      kind: 'get-dirty-documents'
    }])

    expect(registry.resolveRequest(3, {
      requestId: 'req-1',
      ok: true,
      dirtyDocuments: [{ id: '1', filename: 'draft.md' }]
    })).toBe(true)

    await expect(pending).resolves.toEqual({
      requestId: 'req-1',
      ok: true,
      dirtyDocuments: [{ id: '1', filename: 'draft.md' }]
    })
  })

  it('ignores responses from the wrong window and cleans up pending window requests', async () => {
    const registry = createCloseRequestRegistry({
      createRequestId: () => 'req-2'
    })

    const pending = registry.beginRequest(5, 'save-all-dirty-documents', () => {})
    expect(registry.resolveRequest(2, {
      requestId: 'req-2',
      ok: true
    })).toBe(false)

    registry.cleanupWindowRequests(5)

    await expect(pending).resolves.toEqual({
      requestId: 'req-2',
      ok: false,
      error: 'Window closed before renderer responded.'
    })
  })
})
