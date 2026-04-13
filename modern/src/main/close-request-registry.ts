import { randomUUID } from 'node:crypto'
import type { WindowCloseRequest, WindowCloseResponse } from '@shared/contracts'

interface PendingCloseRequest {
  resolve: (response: WindowCloseResponse) => void
  timeout: ReturnType<typeof setTimeout>
  windowId: number
}

interface CreateCloseRequestRegistryOptions {
  createRequestId?: () => string
  timeoutMs?: number
}

export const createCloseRequestRegistry = ({
  createRequestId = randomUUID,
  timeoutMs = 8000
}: CreateCloseRequestRegistryOptions = {}) => {
  const pendingRequests = new Map<string, PendingCloseRequest>()

  const beginRequest = (
    windowId: number,
    kind: WindowCloseRequest['kind'],
    sendRequest: (request: WindowCloseRequest) => void
  ) => {
    const requestId = createRequestId()

    return new Promise<WindowCloseResponse>(resolve => {
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId)
        resolve({
          requestId,
          ok: false,
          error: `Timed out while waiting for renderer to handle "${kind}".`
        })
      }, timeoutMs)

      pendingRequests.set(requestId, {
        windowId,
        resolve,
        timeout
      })

      sendRequest({
        requestId,
        kind
      })
    })
  }

  const resolveRequest = (windowId: number, response: WindowCloseResponse) => {
    const pendingRequest = pendingRequests.get(response.requestId)
    if (!pendingRequest || pendingRequest.windowId !== windowId) {
      return false
    }

    clearTimeout(pendingRequest.timeout)
    pendingRequests.delete(response.requestId)
    pendingRequest.resolve(response)
    return true
  }

  const cleanupWindowRequests = (windowId: number) => {
    for (const [requestId, pendingRequest] of pendingRequests.entries()) {
      if (pendingRequest.windowId !== windowId) {
        continue
      }

      clearTimeout(pendingRequest.timeout)
      pendingRequest.resolve({
        requestId,
        ok: false,
        error: 'Window closed before renderer responded.'
      })
      pendingRequests.delete(requestId)
    }
  }

  return {
    beginRequest,
    cleanupWindowRequests,
    resolveRequest
  }
}
