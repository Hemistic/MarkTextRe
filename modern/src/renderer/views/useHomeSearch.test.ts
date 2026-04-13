import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useHomeSearch } from './useHomeSearch'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'

const createMuyaEditor = (): MuyaEditorExpose => ({
  search: vi.fn(() => ({ total: 3, activeIndex: 1 })),
  find: vi.fn(() => ({ total: 3, activeIndex: 2 })),
  undo: vi.fn(),
  redo: vi.fn(),
  scrollToHeading: vi.fn()
})

const createSidebar = (): SidebarExpose => ({
  focusSearchInput: vi.fn(async () => {})
})

describe('useHomeSearch', () => {
  it('opens the search panel and focuses the sidebar input', async () => {
    const muyaEditor = ref<MuyaEditorExpose | null>(createMuyaEditor())
    const sideBar = ref<SidebarExpose | null>(createSidebar())
    const sideBarMode = ref<'files' | 'search' | 'toc' | ''>('files')
    const applyEditorChange = vi.fn()

    const search = useHomeSearch({
      applyEditorChange,
      muyaEditor,
      sideBar,
      sideBarMode
    })

    await search.openSearchPanel()

    expect(sideBarMode.value).toBe('search')
    expect(sideBar.value?.focusSearchInput).toHaveBeenCalledOnce()
  })

  it('updates search status and handles stepping through matches', () => {
    const muyaEditor = ref<MuyaEditorExpose | null>(createMuyaEditor())
    const sideBar = ref<SidebarExpose | null>(createSidebar())
    const sideBarMode = ref<'files' | 'search' | 'toc' | ''>('files')

    const search = useHomeSearch({
      applyEditorChange: vi.fn(),
      muyaEditor,
      sideBar,
      sideBarMode
    })

    search.updateSearch('marktext')
    expect(search.searchQuery.value).toBe('marktext')
    expect(search.searchTotal.value).toBe(3)
    expect(search.searchActiveIndex.value).toBe(1)

    search.stepSearch('next')
    expect(muyaEditor.value?.find).toHaveBeenCalledWith('next')
    expect(search.searchActiveIndex.value).toBe(2)
  })

  it('re-runs search after editor changes and active document refresh', async () => {
    const muyaEditor = ref<MuyaEditorExpose | null>(createMuyaEditor())
    const sideBar = ref<SidebarExpose | null>(createSidebar())
    const sideBarMode = ref<'files' | 'search' | 'toc' | ''>('files')
    const applyEditorChange = vi.fn()

    const search = useHomeSearch({
      applyEditorChange,
      muyaEditor,
      sideBar,
      sideBarMode
    })

    search.updateSearch('marktext')
    search.handleEditorChange({ markdown: '# updated', wordCount: { word: 1, paragraph: 1, character: 8, all: 8 } })
    expect(applyEditorChange).toHaveBeenCalledOnce()
    expect(muyaEditor.value?.search).toHaveBeenCalledTimes(2)

    search.refreshActiveDocumentSearch()
    await nextTick()
    expect(muyaEditor.value?.search).toHaveBeenCalledTimes(3)
  })

  it('scrolls to the selected heading', () => {
    const muyaEditor = ref<MuyaEditorExpose | null>(createMuyaEditor())
    const sideBar = ref<SidebarExpose | null>(createSidebar())
    const sideBarMode = ref<'files' | 'search' | 'toc' | ''>('files')

    const search = useHomeSearch({
      applyEditorChange: vi.fn(),
      muyaEditor,
      sideBar,
      sideBarMode
    })

    search.handleHeadingSelect('intro')
    expect(muyaEditor.value?.scrollToHeading).toHaveBeenCalledWith('intro')
  })
})
