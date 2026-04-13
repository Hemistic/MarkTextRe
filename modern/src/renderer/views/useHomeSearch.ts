import { nextTick, ref, type Ref } from 'vue'
import type { EditorChangePayload } from '../features/editor/types'
import type { MuyaSearchOptions } from '../features/muya/search'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'

export type HomeSearchOptionKey = keyof MuyaSearchOptions

export interface HomeSearchState {
  searchQuery: Ref<string>
  searchTotal: Ref<number>
  searchActiveIndex: Ref<number>
  searchError: Ref<string>
  searchOptions: Ref<MuyaSearchOptions>
  replaceQuery: Ref<string>
  openSearchPanel: () => Promise<void>
  updateSearch: (value: string) => void
  updateReplace: (value: string) => void
  toggleSearchOption: (key: HomeSearchOptionKey) => void
  stepSearch: (direction: 'prev' | 'next') => void
  replaceCurrent: () => void
  replaceAll: () => void
  handleHeadingSelect: (slug: string) => void
  handleEditorChange: (payload: EditorChangePayload) => void
  refreshActiveDocumentSearch: () => void
}

interface UseHomeSearchOptions {
  applyEditorChange: (payload: EditorChangePayload) => void
  muyaEditor: Ref<MuyaEditorExpose | null>
  sideBar: Ref<SidebarExpose | null>
  sideBarMode: Ref<'files' | 'search' | 'toc' | ''>
}

export const useHomeSearch = ({
  applyEditorChange,
  muyaEditor,
  sideBar,
  sideBarMode
}: UseHomeSearchOptions): HomeSearchState => {
  const searchQuery = ref('')
  const searchTotal = ref(0)
  const searchActiveIndex = ref(-1)
  const searchError = ref('')
  const hasActivatedSearchNavigation = ref(false)
  const searchOptions = ref<MuyaSearchOptions>({
    isCaseSensitive: false,
    isWholeWord: false,
    isRegexp: false
  })
  const replaceQuery = ref('')

  const applySearchStatus = (result?: { total: number, activeIndex: number }) => {
    searchTotal.value = result?.total ?? 0
    searchActiveIndex.value = result?.activeIndex ?? -1
  }

  const resetSearchNavigation = () => {
    hasActivatedSearchNavigation.value = false
  }

  const clearSearchError = () => {
    searchError.value = ''
  }

  const validateRegexp = (value: string) => {
    if (!searchOptions.value.isRegexp) {
      clearSearchError()
      return true
    }

    try {
      const searchReg = new RegExp(value)
      if (value && searchReg.test('')) {
        searchError.value = 'RegExp matches an empty string.'
        applySearchStatus()
        return false
      }
    } catch {
      searchError.value = 'Invalid regular expression.'
      applySearchStatus()
      return false
    }

    clearSearchError()
    return true
  }

  const runSearch = (selectHighlight = false) => {
    if (!validateRegexp(searchQuery.value)) {
      return
    }

    if (!selectHighlight) {
      resetSearchNavigation()
    }

    applySearchStatus(
      muyaEditor.value?.search(searchQuery.value, {
        ...searchOptions.value,
        selectHighlight
      })
    )
  }

  const runReplace = (isSingle: boolean) => {
    if (!searchQuery.value || !validateRegexp(searchQuery.value)) {
      return
    }

    applySearchStatus(
      muyaEditor.value?.replace(replaceQuery.value, {
        ...searchOptions.value,
        isSingle
      })
    )
    resetSearchNavigation()

    nextTick(() => {
      void sideBar.value?.focusSearchInput()
    })
  }

  const openSearchPanel = async () => {
    sideBarMode.value = 'search'
    await nextTick()
    await sideBar.value?.focusSearchInput()
  }

  const updateSearch = (value: string) => {
    searchQuery.value = value
    runSearch()
  }

  const updateReplace = (value: string) => {
    replaceQuery.value = value
  }

  const toggleSearchOption = (key: HomeSearchOptionKey) => {
    searchOptions.value = {
      ...searchOptions.value,
      [key]: !searchOptions.value[key]
    }
    runSearch()
  }

  const stepSearch = (direction: 'prev' | 'next') => {
    if (searchError.value || !searchQuery.value) {
      return
    }

    if (!hasActivatedSearchNavigation.value) {
      const activatedStatus = muyaEditor.value?.search(searchQuery.value, {
        ...searchOptions.value,
        selectHighlight: true
      })

      hasActivatedSearchNavigation.value = true

      if (!activatedStatus?.total) {
        applySearchStatus(activatedStatus)
        return
      }

      applySearchStatus(muyaEditor.value?.find(direction))
      return
    }

    applySearchStatus(muyaEditor.value?.find(direction))
  }

  const replaceCurrent = () => {
    runReplace(true)
  }

  const replaceAll = () => {
    runReplace(false)
  }

  const handleHeadingSelect = (slug: string) => {
    muyaEditor.value?.scrollToHeading(slug)
  }

  const handleEditorChange = (payload: EditorChangePayload) => {
    applyEditorChange(payload)

    if (!searchQuery.value) {
      clearSearchError()
      resetSearchNavigation()
      return
    }

    runSearch()
  }

  const refreshActiveDocumentSearch = () => {
    if (!searchQuery.value) {
      clearSearchError()
      resetSearchNavigation()
      applySearchStatus()
      return
    }

    nextTick(() => {
      runSearch()
    })
  }

  return {
    searchQuery,
    searchTotal,
    searchActiveIndex,
    searchError,
    searchOptions,
    replaceQuery,
    openSearchPanel,
    updateSearch,
    updateReplace,
    toggleSearchOption,
    stepSearch,
    replaceCurrent,
    replaceAll,
    handleHeadingSelect,
    handleEditorChange,
    refreshActiveDocumentSearch
  }
}
