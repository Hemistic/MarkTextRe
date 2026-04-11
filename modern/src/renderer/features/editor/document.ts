import type {
  DirtyDocumentSummary,
  EditorDocument
} from '@shared/contracts'
import type {
  DocumentWordCount,
  EditorChangePayload,
  EditorTab,
  HeadingItem
} from './types'
import defaultSampleMarkdown from '../../assets/default-sample.md?raw'

export const DEFAULT_STATUS = 'Open a Markdown file or create a new one.'
export const UNTITLED_TEMPLATE = '# Untitled\n\n'

export const summarizeMarkdown = (markdown: string) => {
  const headings: HeadingItem[] = markdown
    .split(/\r?\n/)
    .filter(line => /^#{1,6}\s/.test(line))
    .map(line => ({
      depth: line.match(/^#+/)?.[0].length ?? 1,
      text: line.replace(/^#{1,6}\s*/, '')
    }))

  const words = markdown.trim().match(/\S+/g)

  return {
    headings,
    lineCount: markdown.length === 0 ? 1 : markdown.split(/\r?\n/).length,
    wordCount: {
      word: words ? words.length : 0,
      paragraph: markdown.split(/\n{2,}/).filter(line => line.trim()).length,
      character: markdown.length,
      all: markdown.length
    } satisfies DocumentWordCount
  }
}

export const createEditorTab = (document: EditorDocument, kind: EditorTab['kind']): EditorTab => {
  const summary = summarizeMarkdown(document.markdown)

  return {
    ...document,
    kind,
    savedMarkdown: document.markdown,
    headings: summary.headings,
    lineCount: summary.lineCount,
    wordCount: summary.wordCount,
    cursor: null,
    history: null,
    toc: []
  }
}

export const createUntitledDocument = (sequence: number): EditorTab => {
  return createEditorTab({
    id: `untitled:${sequence}:${crypto.randomUUID()}`,
    pathname: null,
    filename: `untitled-${sequence}.md`,
    markdown: UNTITLED_TEMPLATE,
    dirty: false
  }, 'untitled')
}

export const createDefaultSampleDocument = (): EditorTab => {
  return createEditorTab({
    id: 'sample:default',
    pathname: null,
    filename: 'example.md',
    markdown: defaultSampleMarkdown,
    dirty: false
  }, 'sample')
}

export const normalizeOpenedDocument = (document: EditorDocument): EditorTab => {
  return createEditorTab({
    ...document,
    id: document.pathname ?? `imported:${crypto.randomUUID()}`,
    dirty: false
  }, 'file')
}

export const getDirtyDocumentSummaries = (tabs: EditorTab[]): DirtyDocumentSummary[] => {
  return tabs
    .filter(tab => tab.dirty)
    .map(tab => ({
      id: tab.id,
      filename: tab.filename
    }))
}

export const updateTabMarkdown = (tabs: EditorTab[], activeDocumentId: string, markdown: string) => {
  return tabs.map(tab => {
    if (tab.id !== activeDocumentId) {
      return tab
    }

    const summary = summarizeMarkdown(markdown)

    return {
      ...tab,
      markdown,
      dirty: markdown !== tab.savedMarkdown,
      headings: summary.headings,
      lineCount: summary.lineCount,
      wordCount: summary.wordCount
    }
  })
}

export const applyEditorPayloadToTab = (tabs: EditorTab[], activeDocumentId: string, payload: EditorChangePayload) => {
  return tabs.map(tab => {
    if (tab.id !== activeDocumentId) {
      return tab
    }

    const summary = summarizeMarkdown(payload.markdown)
    const nextToc = payload.toc ?? tab.toc
    const headings = nextToc.length > 0
      ? nextToc.map(item => ({
        depth: item.lvl,
        text: item.content
      }))
      : summary.headings

    return {
      ...tab,
      markdown: payload.markdown,
      dirty: payload.markdown !== tab.savedMarkdown,
      headings,
      lineCount: summary.lineCount,
      wordCount: payload.wordCount ?? summary.wordCount,
      cursor: payload.cursor ?? tab.cursor,
      history: payload.history ?? tab.history,
      toc: nextToc
    }
  })
}
