import type { MuyaReplaceOptions, MuyaSearchRequest } from '../features/muya/search'

export interface MuyaEditorExpose {
  search: (value: string, options?: MuyaSearchRequest) => { total: number, activeIndex: number }
  replace: (value: string, options?: MuyaReplaceOptions) => { total: number, activeIndex: number }
  find: (direction: 'prev' | 'next') => { total: number, activeIndex: number }
  undo: () => void
  redo: () => void
  scrollToHeading: (slug: string) => void
}

export interface SidebarExpose {
  focusSearchInput: () => Promise<void>
}
