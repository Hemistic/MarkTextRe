import type { DocumentWordCount, EditorTab, HeadingItem, TocItem } from './types'

export const resolveHeadingsFromToc = (
  toc: TocItem[] | undefined,
  fallbackHeadings: HeadingItem[]
) => {
  if (!toc || toc.length === 0) {
    return fallbackHeadings
  }

  return toc.map(item => ({
    depth: item.lvl,
    text: item.content
  }))
}

export const createMarkdownUpdatePatch = (
  savedMarkdown: string,
  markdown: string,
  summary: {
    headings: HeadingItem[]
    lineCount: number
    wordCount: DocumentWordCount
  }
) => {
  return {
    dirty: markdown !== savedMarkdown,
    headings: summary.headings,
    lineCount: summary.lineCount,
    markdown,
    wordCount: summary.wordCount
  }
}

export const createEditorPayloadPatch = (
  tab: Pick<EditorTab, 'savedMarkdown' | 'toc'>,
  payload: {
    markdown: string
    toc?: TocItem[]
    wordCount?: DocumentWordCount
  },
  summary: {
    headings: HeadingItem[]
    lineCount: number
    wordCount: DocumentWordCount
  }
) => {
  const nextToc = payload.toc ?? tab.toc

  return {
    dirty: payload.markdown !== tab.savedMarkdown,
    headings: resolveHeadingsFromToc(nextToc, summary.headings),
    lineCount: summary.lineCount,
    markdown: payload.markdown,
    toc: nextToc,
    wordCount: payload.wordCount ?? summary.wordCount
  }
}
