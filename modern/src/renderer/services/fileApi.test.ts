import type { MarkTextApi, MarkTextFilesApi } from '@shared/contracts'
import { afterEach, describe, expect, it } from 'vitest'
import {
  getFilesApi,
  invokeFilesAction,
  invokeFilesNotification,
  withFilesApi
} from './fileApi'

describe('fileApi helper', () => {
  const originalWindowMarkText = (globalThis as any).window?.marktext

  const ensureWindow = () => {
    if (!(globalThis as any).window) {
      ;(globalThis as any).window = {}
    }
  }

  const setBridge = (bridge: MarkTextApi | null) => {
    ensureWindow()
    if (bridge) {
      ;(globalThis as any).window.marktext = bridge
      return
    }

    delete (globalThis as any).window.marktext
  }

  const stubFiles: MarkTextFilesApi = {
    getRecentDocuments: async () => [],
    removeRecentDocument: async () => undefined,
    pickOpenPaths: async () => [],
    openMarkdown: async () => null,
    openMarkdownInNewWindow: async () => false,
    openMarkdownAtPath: async () => null,
    openMarkdownAtPathInNewWindow: async () => false,
    openFolder: async () => null,
    openFolderAtPath: async () => null,
    openFolderInNewWindow: async () => false,
    openFolderAtPathInNewWindow: async () => false,
    pickImage: async () => null,
    processLocalImage: async () => null,
    saveMarkdown: async () => null,
    saveMarkdownAs: async () => null
  }

  const stubApi: MarkTextApi = {
    app: {} as MarkTextApi['app'],
    files: stubFiles,
    settings: {} as MarkTextApi['settings'],
    window: {} as MarkTextApi['window']
  }

  afterEach(() => {
    setBridge(originalWindowMarkText ?? null)
  })

  it('returns null when the files bridge is missing', async () => {
    setBridge(null)

    expect(getFilesApi()).toBeNull()
    expect(withFilesApi(() => 'ok')).toBeNull()
    await expect(invokeFilesAction(async () => 'ok', 'fallback')).resolves.toBe('fallback')
  })

  it('runs actions and notifications through the files bridge when present', async () => {
    let touched = false
    setBridge(stubApi)

    expect(getFilesApi()).toBe(stubFiles)
    expect(withFilesApi(files => files)).toBe(stubFiles)
    await expect(invokeFilesAction(async () => 'ok', 'fallback')).resolves.toBe('ok')
    await invokeFilesNotification(async () => {
      touched = true
    })
    expect(touched).toBe(true)
  })
})
