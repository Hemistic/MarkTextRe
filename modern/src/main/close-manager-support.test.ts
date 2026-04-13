import { describe, expect, it, vi } from 'vitest'
import type { BrowserWindow, WebContents } from 'electron'
import type { WindowCloseResponse } from '@shared/contracts'
import {
  createFinalizeWindowClose,
  createWindowCloseFlowHandler,
  createWindowClosedHandler,
  createWindowCloseEventHandler,
  createWindowCloseRequestSender,
  createWindowCloseResponseHandler,
  handleWindowCloseResponse,
  requestWindowCloseAction,
  resolveDirtyDocumentsResponse,
  resolveSaveAllDirtyDocumentsResponse
} from './close-manager-support'

const createWindow = (id = 1) => ({
  close: vi.fn(),
  id
}) as unknown as BrowserWindow

describe('close-manager-support', () => {
  it('requests renderer close actions through the request registry', async () => {
    const window = createWindow(7)
    const beginRequest = vi.fn(async (_windowId, _kind, sendRequest) => {
      sendRequest({ requestId: 'req-1', kind: 'get-dirty-documents' })
      return {
        requestId: 'req-1',
        ok: true,
        dirtyDocuments: []
      } satisfies WindowCloseResponse
    })
    const sendRequest = vi.fn()

    await expect(
      requestWindowCloseAction(window, 'get-dirty-documents', beginRequest, sendRequest)
    ).resolves.toEqual({
      requestId: 'req-1',
      ok: true,
      dirtyDocuments: []
    })

    expect(beginRequest).toHaveBeenCalledOnce()
    expect(sendRequest).toHaveBeenCalledWith(window, {
      requestId: 'req-1',
      kind: 'get-dirty-documents'
    })
  })

  it('creates a channel-bound renderer close sender', () => {
    const send = vi.fn()
    const sender = createWindowCloseRequestSender('marktext:app:window-close-request')
    const window = {
      webContents: { send }
    } as unknown as BrowserWindow

    sender(window, { requestId: 'req-1', kind: 'get-dirty-documents' })

    expect(send).toHaveBeenCalledWith('marktext:app:window-close-request', {
      requestId: 'req-1',
      kind: 'get-dirty-documents'
    })
  })

  it('normalizes close responses from the renderer', () => {
    const logError = vi.fn()

    expect(resolveDirtyDocumentsResponse({
      requestId: 'req-1',
      ok: true,
      dirtyDocuments: [{ id: 'tab-1', filename: 'draft.md' }]
    }, logError)).toEqual([{ id: 'tab-1', filename: 'draft.md' }])

    expect(resolveDirtyDocumentsResponse({
      requestId: 'req-2',
      ok: false,
      error: 'read failed'
    }, logError)).toEqual([])

    expect(logError).toHaveBeenCalledWith(
      '[main] failed to get dirty documents from renderer:',
      'read failed'
    )

    expect(resolveSaveAllDirtyDocumentsResponse({
      requestId: 'req-3',
      ok: false,
      error: 'save failed'
    }, logError)).toBe(false)

    expect(logError).toHaveBeenCalledWith(
      '[main] failed to save dirty documents before closing:',
      'save failed'
    )
  })

  it('marks windows as closing before issuing the native close', () => {
    const window = createWindow(3)
    const markClosing = vi.fn()
    const finalizeWindowClose = createFinalizeWindowClose(markClosing)

    finalizeWindowClose(window)

    expect(markClosing).toHaveBeenCalledWith(3)
    expect(window.close).toHaveBeenCalledOnce()
  })

  it('creates close and closed handlers that delegate lifecycle work', async () => {
    const window = createWindow(5)
    const preventDefault = vi.fn()
    const handleWindowCloseRequestMock = vi.fn(async () => {})
    const beginPendingClose = vi.fn(() => true)
    const finishPendingClose = vi.fn()
    const cleanupWindow = vi.fn()
    const cleanupWindowRequests = vi.fn()

    const onClose = createWindowCloseEventHandler(window, {
      beginPendingClose,
      finishPendingClose,
      handleWindowCloseRequest: handleWindowCloseRequestMock,
      shouldAllowNativeClose: () => false
    })
    const onClosed = createWindowClosedHandler(window.id, {
      cleanupWindow,
      cleanupWindowRequests
    })

    onClose({ preventDefault })
    await Promise.resolve()
    await Promise.resolve()
    onClosed()

    expect(preventDefault).toHaveBeenCalledOnce()
    expect(beginPendingClose).toHaveBeenCalledWith(5)
    expect(handleWindowCloseRequestMock).toHaveBeenCalledWith(window)
    expect(finishPendingClose).toHaveBeenCalledWith(5)
    expect(cleanupWindow).toHaveBeenCalledWith(5)
    expect(cleanupWindowRequests).toHaveBeenCalledWith(5)
  })

  it('creates a reusable close-flow handler factory', async () => {
    const window = createWindow(12)
    const preventDefault = vi.fn()
    const handleWindowCloseRequestMock = vi.fn(async () => {})
    const finishPendingClose = vi.fn()
    const factory = createWindowCloseFlowHandler(handleWindowCloseRequestMock, {
      beginPendingClose: vi.fn(() => true),
      finishPendingClose,
      shouldAllowNativeClose: () => false
    })

    const onClose = factory(window)
    onClose({ preventDefault })
    await Promise.resolve()
    await Promise.resolve()

    expect(preventDefault).toHaveBeenCalledOnce()
    expect(handleWindowCloseRequestMock).toHaveBeenCalledWith(window)
    expect(finishPendingClose).toHaveBeenCalledWith(12)
  })

  it('skips async close handling when native close is allowed or a close is already pending', () => {
    const window = createWindow(9)
    const preventDefault = vi.fn()
    const handleWindowCloseRequestMock = vi.fn(async () => {})

    const allowNativeClose = createWindowCloseEventHandler(window, {
      beginPendingClose: vi.fn(() => true),
      finishPendingClose: vi.fn(),
      handleWindowCloseRequest: handleWindowCloseRequestMock,
      shouldAllowNativeClose: () => true
    })

    allowNativeClose({ preventDefault })

    expect(preventDefault).not.toHaveBeenCalled()
    expect(handleWindowCloseRequestMock).not.toHaveBeenCalled()

    const pendingClose = createWindowCloseEventHandler(window, {
      beginPendingClose: vi.fn(() => false),
      finishPendingClose: vi.fn(),
      handleWindowCloseRequest: handleWindowCloseRequestMock,
      shouldAllowNativeClose: () => false
    })

    pendingClose({ preventDefault })

    expect(preventDefault).toHaveBeenCalledOnce()
    expect(handleWindowCloseRequestMock).not.toHaveBeenCalled()
  })

  it('routes renderer close responses back to the matching request registry', () => {
    const sender = {} as WebContents
    const response: WindowCloseResponse = {
      requestId: 'req-4',
      ok: true
    }
    const resolveRequest = vi.fn(() => true)

    expect(
      handleWindowCloseResponse(
        sender,
        response,
        () => createWindow(11),
        resolveRequest
      )
    ).toBe(true)

    expect(resolveRequest).toHaveBeenCalledWith(11, response)

    expect(
      handleWindowCloseResponse(
        sender,
        response,
        () => null,
        resolveRequest
      )
    ).toBe(false)
  })

  it('creates an ipc event handler for close responses', () => {
    const response: WindowCloseResponse = {
      requestId: 'req-5',
      ok: true
    }
    const resolveRequest = vi.fn(() => true)
    const eventHandler = createWindowCloseResponseHandler(
      () => createWindow(13),
      resolveRequest
    )

    expect(eventHandler({ sender: {} as WebContents } as Electron.IpcMainEvent, response)).toBe(true)
    expect(resolveRequest).toHaveBeenCalledWith(13, response)
  })
})
