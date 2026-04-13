import type {
  DirtyDocumentSummary,
  EditorDocument
} from '@shared/contracts'
import type {
  EditorChangePayload,
  EditorTab
} from './types'
import defaultSampleMarkdown from '../../assets/default-sample.md?raw'
import { summarizeMarkdown } from './document-summary-support'
import {
  createEditorPayloadPatch,
  createMarkdownUpdatePatch
} from './document-payload-support'

export const DEFAULT_STATUS = 'Open a Markdown file or create a new one.'
export const UNTITLED_TEMPLATE = '# Untitled\n\n'
export { summarizeMarkdown } from './document-summary-support'

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

    return {
      ...tab,
      ...createMarkdownUpdatePatch(tab.savedMarkdown, markdown, summarizeMarkdown(markdown))
    }
  })
}

export const updateEditorTabMarkdownInPlace = (tab: EditorTab, markdown: string) => {
  Object.assign(tab, createMarkdownUpdatePatch(tab.savedMarkdown, markdown, summarizeMarkdown(markdown)))

  return tab
}

export const applyEditorPayloadToTab = (tabs: EditorTab[], activeDocumentId: string, payload: EditorChangePayload) => {
  return tabs.map(tab => {
    if (tab.id !== activeDocumentId) {
      return tab
    }

    return {
      ...tab,
      ...createEditorPayloadPatch(tab, payload, summarizeMarkdown(payload.markdown)),
      cursor: tab.cursor,
      history: tab.history,
    }
  })
}

export const applyEditorPayloadToTabInPlace = (tab: EditorTab, payload: EditorChangePayload) => {
  Object.assign(tab, createEditorPayloadPatch(tab, payload, summarizeMarkdown(payload.markdown)))

  return tab
}
