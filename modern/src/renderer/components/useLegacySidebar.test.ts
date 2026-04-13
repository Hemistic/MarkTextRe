import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useLegacySidebar } from './useLegacySidebar'

describe('useLegacySidebar', () => {
  it('derives sidebar width, search status, and toc entries', () => {
    const mode = ref<'files' | 'search' | 'toc' | ''>('toc')
    const sidebar = useLegacySidebar(
      computed(() => mode.value),
      computed(() => [
        { content: 'Heading', lvl: 2, slug: 'heading' },
        { content: 'No Slug', lvl: 1, slug: '' }
      ]),
      {
        searchQuery: ref('term'),
        replaceQuery: ref('replacement'),
        searchTotal: ref(4),
        searchActiveIndex: ref(1),
        searchError: ref(''),
        searchOptions: ref({
          isCaseSensitive: false,
          isWholeWord: false,
          isRegexp: false
        })
      },
      {
        updateMode: vi.fn(),
        updateSearchQuery: vi.fn(),
        updateReplaceQuery: vi.fn(),
        toggleSearchOption: vi.fn(),
        searchNext: vi.fn(),
        searchPrev: vi.fn(),
        replaceCurrent: vi.fn(),
        replaceAll: vi.fn()
      }
    )

    expect(sidebar.sidebarWidth.value).toBe('280px')
    expect(sidebar.searchStatus.value).toBe('2/4')
    expect(sidebar.showTocPanel.value).toBe(true)
    expect(sidebar.tocEntries.value).toEqual([
      {
        content: 'Heading',
        indent: '12px',
        key: 'heading',
        slug: 'heading'
      },
      {
        content: 'No Slug',
        indent: '0px',
        key: '',
        slug: ''
      }
    ])
  })

  it('toggles the active mode and routes enter key navigation', () => {
    const updateMode = vi.fn()
    const searchNext = vi.fn()
    const searchPrev = vi.fn()
    const mode = ref<'files' | 'search' | 'toc' | ''>('files')
    const sidebar = useLegacySidebar(
      computed(() => mode.value),
      computed(() => []),
      {
        searchQuery: ref(''),
        replaceQuery: ref(''),
        searchTotal: ref(0),
        searchActiveIndex: ref(-1),
        searchError: ref(''),
        searchOptions: ref({
          isCaseSensitive: false,
          isWholeWord: false,
          isRegexp: false
        })
      },
      {
        updateMode,
        updateSearchQuery: vi.fn(),
        updateReplaceQuery: vi.fn(),
        toggleSearchOption: vi.fn(),
        searchNext,
        searchPrev,
        replaceCurrent: vi.fn(),
        replaceAll: vi.fn()
      }
    )

    sidebar.toggleMode('files')
    sidebar.toggleMode('search')

    expect(updateMode).toHaveBeenNthCalledWith(1, '')
    expect(updateMode).toHaveBeenNthCalledWith(2, 'search')

    const preventDefault = vi.fn()
    sidebar.handleSearchKeydown({
      key: 'Enter',
      shiftKey: false,
      preventDefault
    } as unknown as KeyboardEvent)
    sidebar.handleSearchKeydown({
      key: 'Enter',
      shiftKey: true,
      preventDefault
    } as unknown as KeyboardEvent)

    expect(preventDefault).toHaveBeenCalledTimes(2)
    expect(searchNext).toHaveBeenCalledOnce()
    expect(searchPrev).toHaveBeenCalledOnce()
  })
})
