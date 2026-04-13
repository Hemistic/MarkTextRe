import { computed, nextTick, ref, watch, type Ref } from 'vue'
import type { TocItem } from '../features/editor/types'
import type { HomeSearchOptionKey } from '../views/useHomeSearch'
import {
  createLegacySidebarSearchStatus,
  createLegacySidebarTocEntries,
  createLegacySidebarWidth
} from './legacySidebarSupport'

export type LegacySidebarMode = 'files' | 'search' | 'toc' | ''

type SearchState = {
  searchQuery: Readonly<Ref<string>>
  replaceQuery: Readonly<Ref<string>>
  searchTotal: Readonly<Ref<number>>
  searchActiveIndex: Readonly<Ref<number>>
  searchError: Readonly<Ref<string>>
  searchOptions: Readonly<Ref<{
    isCaseSensitive: boolean
    isWholeWord: boolean
    isRegexp: boolean
  }>>
}

type SidebarModeRef = Readonly<Ref<LegacySidebarMode>>

type SidebarEmitter = {
  updateMode: (value: LegacySidebarMode) => void
  updateSearchQuery: (value: string) => void
  updateReplaceQuery: (value: string) => void
  toggleSearchOption: (key: HomeSearchOptionKey) => void
  searchNext: () => void
  searchPrev: () => void
  replaceCurrent: () => void
  replaceAll: () => void
}

export const useLegacySidebar = (
  mode: SidebarModeRef,
  tocItems: Readonly<Ref<TocItem[]>>,
  searchState: SearchState,
  emit: SidebarEmitter
) => {
  const searchInput = ref<HTMLInputElement | null>(null)
  const localSearchQuery = ref(searchState.searchQuery.value)
  const localReplaceQuery = ref(searchState.replaceQuery.value)
  const searchStatus = computed(() => createLegacySidebarSearchStatus(
    searchState.searchTotal.value,
    searchState.searchActiveIndex.value
  ))
  const searchError = computed(() => searchState.searchError.value)
  const searchOptions = computed(() => searchState.searchOptions.value)
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

  const handleReplaceInput = () => {
    emit.updateReplaceQuery(localReplaceQuery.value)
  }

  const toggleSearchOption = (key: HomeSearchOptionKey) => {
    emit.toggleSearchOption(key)
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

  watch(searchState.replaceQuery, value => {
    if (value !== localReplaceQuery.value) {
      localReplaceQuery.value = value
    }
  })

  watch(mode, currentMode => {
    if (currentMode === 'search') {
      void focusSearchInput()
    }
  })

  return {
    localSearchQuery,
    localReplaceQuery,
    searchError,
    searchOptions,
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
    handleReplaceInput,
    toggleSearchOption,
    handleSearchKeydown
  }
}
