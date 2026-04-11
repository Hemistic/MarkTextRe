import type { EditorDocument, EditorTabKind } from '@shared/contracts'

export interface HeadingItem {
  depth: number
  text: string
}

export interface DocumentWordCount {
  word: number
  paragraph: number
  character: number
  all: number
}

export interface TocItem {
  content: string
  lvl: number
}

export interface EditorTab extends EditorDocument {
  kind: EditorTabKind
  savedMarkdown: string
  headings: HeadingItem[]
  lineCount: number
  wordCount: DocumentWordCount
  cursor: unknown
  history: unknown
  toc: TocItem[]
}

export interface EditorChangePayload {
  markdown: string
  wordCount?: DocumentWordCount
  cursor?: unknown
  history?: unknown
  toc?: TocItem[]
}

export type SidebarTabItem = Pick<EditorTab, 'id' | 'filename' | 'pathname' | 'dirty'>
