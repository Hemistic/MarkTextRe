export interface MuyaEditorExpose {
  search: (value: string) => { total: number, activeIndex: number }
  find: (direction: 'prev' | 'next') => { total: number, activeIndex: number }
  undo: () => void
  redo: () => void
  scrollToHeading: (slug: string) => void
}

export interface SidebarExpose {
  focusSearchInput: () => Promise<void>
}
