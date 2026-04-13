import type { TocItem } from '../features/editor/types'
import type { LegacySidebarMode } from './useLegacySidebar'

export const LEGACY_SIDEBAR_ICONS = [
  { name: 'files', label: 'Files' },
  { name: 'search', label: 'Search' },
  { name: 'toc', label: 'Outline' }
] as const

export interface LegacySidebarTocEntry {
  content: string
  indent: string
  key: string
  slug: string | null
}

export const createLegacySidebarWidth = (mode: LegacySidebarMode) => {
  return mode ? '280px' : '45px'
}

export const createLegacySidebarSearchStatus = (
  total: number,
  activeIndex: number
) => {
  if (total === 0) {
    return '0/0'
  }

  return `${activeIndex + 1}/${total}`
}

export const createLegacySidebarTocEntries = (
  tocItems: TocItem[]
): LegacySidebarTocEntry[] => {
  return tocItems.map(heading => ({
    content: heading.content,
    indent: `${(heading.lvl - 1) * 12}px`,
    key: heading.slug ?? `${heading.lvl}:${heading.content}`,
    slug: heading.slug ?? null
  }))
}
