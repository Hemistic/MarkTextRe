import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createMainWindowOptions,
  getRendererLoadTarget,
  resolvePreloadPath
} from './window-support'

describe('window support', () => {
  it('resolves preload paths for dev and production', () => {
    expect(resolvePreloadPath({
      isDev: true,
      currentDirname: '/app/dist-electron'
    })).toBe(path.resolve('/app/dist-electron', '../src/preload/preload.cjs'))

    expect(resolvePreloadPath({
      isDev: false,
      currentDirname: '/app/dist-electron'
    })).toBe(path.join('/app/dist-electron', 'preload.cjs'))
  })

  it('creates stable browser window options', () => {
    expect(createMainWindowOptions({
      initialBounds: { width: 1200, height: 800, x: 10, y: 20 },
      isDev: true,
      platform: 'darwin',
      preloadPath: '/app/preload.cjs'
    })).toMatchObject({
      width: 1200,
      height: 800,
      x: 10,
      y: 20,
      minWidth: 1024,
      minHeight: 640,
      backgroundColor: '#f4f1e8',
      frame: true,
      titleBarStyle: 'hiddenInset',
      show: false,
      webPreferences: {
        preload: '/app/preload.cjs',
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: true,
        spellcheck: true
      }
    })
  })

  it('resolves renderer load targets', () => {
    expect(getRendererLoadTarget({
      currentDirname: '/app/dist-electron',
      devServerUrl: 'http://localhost:5173/'
    })).toEqual({
      kind: 'url',
      target: 'http://localhost:5173/'
    })

    expect(getRendererLoadTarget({
      currentDirname: '/app/dist-electron'
    })).toEqual({
      kind: 'file',
      target: path.join('/app/dist-electron', '../dist/index.html')
    })
  })
})
