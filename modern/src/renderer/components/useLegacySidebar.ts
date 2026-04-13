import { computed, nextTick, ref, watch, type Ref } from 'vue'
import type { TocItem } from '../features/editor/types'
import {
  createLegacySidebarSearchStatus,
  createLegacySidebarTocEntries,
  createLegacySidebarWidth
} from './legacySidebarSupport'

export type LegacySidebarMode = 'files' | 'search' | 'toc' | ''

type SearchState = {
  searchQuery: Readonly<Ref<string>>
  searchTotal: Readonly<Ref<number>>
  searchActiveIndex: Readonly<Ref<number>>
}

type SidebarModeRef = Readonly<Ref<LegacySidebarMode>>

type SidebarEmitter = {
  updateMode: (value: LegacySidebarMode) => void
  updateSearchQuery: (value: string) => void
  searchNext: () => void
  searchPrev: () => void
}

export const useLegacySidebar = (
  mode: SidebarModeRef,
  tocItems: Readonly<Ref<TocItem[]>>,
  searchState: SearchState,
  emit: SidebarEmitter
) => {
  const searchInput = ref<HTMLInputElement | null>(null)
  const localSearchQuery = ref(searchState.searchQuery.value)
  const searchStatus = computed(() => createLegacySidebarSearchStatus(
    searchState.searchTotal.value,
    searchState.searchActiveIndex.value
  ))
  const sidebarWidth = computed(() => createLegacySidebarWidth(mode.value))
  const tocEntries = computed(() => createLegacySidebarTocEntries(tocItems.value))
  const showFilesPanel = computed(() => mode.value === 'files')
  const showSearchPanel = computed(() => mode.value === 'search')
  const showTocPanel = computed(() => mode.value === 'toc')

  const toggleMode = (nextMode: Exclude<LegacySidebarMode, ''>) => {
    emit.updateMode(mode.value === nextMode ? '' : nextMode)
  }

  const focusSearchInput = async () => {
    await nextTick()
    searchInput.value?.focus()
    searchInput.value?.select()
  }

  const handleSearchInput = () => {
    emit.updateSearchQuery(localSearchQuery.value)
  }

  const handleSearchKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') return

    event.preventDefault()
    if (event.shiftKey) {
      emit.searchPrev()
    } else {
      emit.searchNext()
    }
  }

  watch(searchState.searchQuery, value => {
    if (value !== localSearchQuery.value) {
      localSearchQuery.value = value
    }
  })

  watch(mode, currentMode => {
    if (currentMode === 'search') {
      void focusSearchInput()
    }
  })

  return {
    localSearchQuery,
    searchInput,
    searchStatus,
    sidebarWidth,
    tocEntries,
    showFilesPanel,
    showSearchPanel,
    showTocPanel,
    toggleMode,
    focusSearchInput,
    handleSearchInput,
    handleSearchKeydown
  }
}
