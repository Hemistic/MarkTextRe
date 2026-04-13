import { describe, expect, it, vi } from 'vitest'
import {
  createApplicationMenuTemplate,
  createAppCommandMenuItem,
  createMacAppMenu,
  createRecentFilesSubmenu,
  createViewSubmenu,
  createWindowSubmenu
} from './menu-support'

describe('menu support', () => {
  it('creates app command menu items', () => {
    const dispatchCommand = vi.fn()
    const item = createAppCommandMenuItem('save-file', dispatchCommand)

    item.click?.(undefined as never, undefined as never, undefined as never)
    expect(dispatchCommand).toHaveBeenCalledWith('save-file')
    expect(item.label).toBe('Save')
    expect(item.accelerator).toBe('CmdOrCtrl+S')
  })

  it('creates a placeholder when no recent files are available', () => {
    expect(createRecentFilesSubmenu([], {
      onClearRecentFiles: vi.fn(),
      onOpenRecentFile: vi.fn()
    })).toEqual([{
      label: 'No Recent Files',
      enabled: false
    }])
  })

  it('creates recent file items and clear action', () => {
    const onOpenRecentFile = vi.fn()
    const onClearRecentFiles = vi.fn()
    const items = createRecentFilesSubmenu([
      { filename: 'notes.md', pathname: '/docs/notes.md' }
    ], {
      onClearRecentFiles,
      onOpenRecentFile
    })

    items[0]?.click?.(undefined as never, undefined as never, undefined as never)
    items[2]?.click?.(undefined as never, undefined as never, undefined as never)

    expect(onOpenRecentFile).toHaveBeenCalledWith('/docs/notes.md')
    expect(onClearRecentFiles).toHaveBeenCalledOnce()
  })

  it('builds dev and platform-specific submenu shapes', () => {
    expect(createViewSubmenu(true).some(item => item.role === 'toggleDevTools')).toBe(true)
    expect(createViewSubmenu(false).some(item => item.role === 'toggleDevTools')).toBe(false)
    expect(createWindowSubmenu(true).some(item => item.role === 'window')).toBe(true)
    expect(createWindowSubmenu(false).some(item => item.role === 'close')).toBe(true)
    expect(createMacAppMenu('MarkText', true)).toHaveLength(1)
    expect(createMacAppMenu('MarkText', false)).toHaveLength(0)
  })

  it('creates the application menu template with file/edit/view/window sections', () => {
    const dispatchAppCommand = vi.fn()
    const template = createApplicationMenuTemplate({
      appName: 'MarkText',
      dispatchAppCommand,
      isDev: true,
      isMac: false,
      recentFilesSubmenu: [{ label: 'notes.md' }]
    })

    expect(template.map(item => item.label)).toEqual(['File', 'Edit', 'View', 'Window'])
    const fileMenu = template[0]
    expect(Array.isArray(fileMenu?.submenu)).toBe(true)

    const newFileItem = (fileMenu?.submenu as Electron.MenuItemConstructorOptions[])[0]
    newFileItem.click?.(undefined as never, undefined as never, undefined as never)
    expect(dispatchAppCommand).toHaveBeenCalledWith('new-file')
  })
})
