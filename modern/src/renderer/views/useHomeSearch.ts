import { nextTick, ref, type Ref } from 'vue'
import type { EditorChangePayload } from '../features/editor/types'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'

export interface HomeSearchState {
  searchQuery: Ref<string>
  searchTotal: Ref<number>
  searchActiveIndex: Ref<number>
  openSearchPanel: () => Promise<void>
  updateSearch: (value: string) => void
  stepSearch: (direction: 'prev' | 'next') => void
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

  const applySearchStatus = (result?: { total: number, activeIndex: number }) => {
    searchTotal.value = result?.total ?? 0
    searchActiveIndex.value = result?.activeIndex ?? -1
  }

  const openSearchPanel = async () => {
    sideBarMode.value = 'search'
    await nextTick()
    await sideBar.value?.focusSearchInput()
  }

  const updateSearch = (value: string) => {
    searchQuery.value = value
    applySearchStatus(muyaEditor.value?.search(value))
  }

  const stepSearch = (direction: 'prev' | 'next') => {
    applySearchStatus(
      searchQuery.value
        ? muyaEditor.value?.find(direction)
        : muyaEditor.value?.search(searchQuery.value)
    )
  }

  const handleHeadingSelect = (slug: string) => {
    muyaEditor.value?.scrollToHeading(slug)
  }

  const handleEditorChange = (payload: EditorChangePayload) => {
    applyEditorChange(payload)

    if (!searchQuery.value) {
      return
    }

    applySearchStatus(muyaEditor.value?.search(searchQuery.value))
  }

  const refreshActiveDocumentSearch = () => {
    if (!searchQuery.value) {
      applySearchStatus()
      return
    }

    nextTick(() => {
      applySearchStatus(muyaEditor.value?.search(searchQuery.value))
    })
  }

  return {
    searchQuery,
    searchTotal,
    searchActiveIndex,
    openSearchPanel,
    updateSearch,
    stepSearch,
    handleHeadingSelect,
    handleEditorChange,
    refreshActiveDocumentSearch
  }
}
