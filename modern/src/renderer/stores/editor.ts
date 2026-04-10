import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AppBootstrap, EditorDocument } from '@shared/contracts'
import defaultSampleMarkdown from '../assets/default-sample.md?raw'

type EditorViewMode = 'home' | 'editor'
type EditorTabKind = 'untitled' | 'sample' | 'file'

interface RecentDocument {
  pathname: string
  filename: string
}

interface HeadingItem {
  depth: number
  text: string
}

interface DocumentWordCount {
  word: number
  paragraph: number
  character: number
  all: number
}

interface EditorTab extends EditorDocument {
  kind: EditorTabKind
  savedMarkdown: string
  headings: HeadingItem[]
  lineCount: number
  wordCount: DocumentWordCount
  cursor: unknown
  history: unknown
  toc: Array<{ content: string, lvl: number }>
}

interface EditorChangePayload {
  markdown: string
  wordCount?: DocumentWordCount
  cursor?: unknown
  history?: unknown
  toc?: Array<{ content: string, lvl: number }>
}

const RECENT_STORAGE_KEY = 'marktext-modern:recent-documents'
const DEFAULT_STATUS = 'Open a Markdown file or create a new one.'
const UNTITLED_TEMPLATE = '# Untitled\n\n'

const summarizeMarkdown = (markdown: string) => {
  const headings = markdown
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

const createEditorTab = (document: EditorDocument, kind: EditorTabKind): EditorTab => {
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

const createUntitledDocument = (sequence: number): EditorTab => {
  return createEditorTab({
    id: `untitled:${sequence}:${crypto.randomUUID()}`,
    pathname: null,
    filename: `untitled-${sequence}.md`,
    markdown: UNTITLED_TEMPLATE,
    dirty: false
  }, 'untitled')
}

const createDefaultSampleDocument = (): EditorTab => {
  return createEditorTab({
    id: 'sample:default',
    pathname: null,
    filename: 'example.md',
    markdown: defaultSampleMarkdown,
    dirty: false
  }, 'sample')
}

const normalizeOpenedDocument = (document: EditorDocument): EditorTab => {
  return createEditorTab({
    ...document,
    id: document.pathname ?? `imported:${crypto.randomUUID()}`,
    dirty: false
  }, 'file')
}

const getStoredRecentDocuments = (): RecentDocument[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as RecentDocument[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(item => typeof item?.pathname === 'string' && typeof item?.filename === 'string')
  } catch {
    return []
  }
}

const setStoredRecentDocuments = (recentDocuments: RecentDocument[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentDocuments))
}

export const useEditorStore = defineStore('editor', () => {
  const bootstrap = ref<AppBootstrap | null>(null)
  const viewMode = ref<EditorViewMode>('home')
  const tabs = ref<EditorTab[]>([])
  const activeTabId = ref<string | null>(null)
  const untitledSequence = ref(1)
  const recentDocuments = ref<RecentDocument[]>(getStoredRecentDocuments())
  const status = ref(DEFAULT_STATUS)

  const activeDocument = computed(() => {
    if (!activeTabId.value) return null
    return tabs.value.find(tab => tab.id === activeTabId.value) ?? null
  })

  const hasOpenDocument = computed(() => activeDocument.value !== null)

  const headings = computed(() => {
    return activeDocument.value?.headings ?? []
  })

  const wordCount = computed(() => {
    return activeDocument.value?.wordCount.word ?? 0
  })

  const lineCount = computed(() => {
    return activeDocument.value?.lineCount ?? 1
  })

  const setEditorMode = () => {
    viewMode.value = activeDocument.value ? 'editor' : 'home'
  }

  const addRecentDocument = (document: EditorDocument) => {
    if (!document.pathname) return

    recentDocuments.value = [
      { pathname: document.pathname, filename: document.filename },
      ...recentDocuments.value.filter(item => item.pathname !== document.pathname)
    ].slice(0, 8)

    setStoredRecentDocuments(recentDocuments.value)
  }

  const setActiveTab = (id: string) => {
    if (tabs.value.some(tab => tab.id === id)) {
      activeTabId.value = id
      setEditorMode()
    }
  }

  const loadBootstrap = async () => {
    recentDocuments.value = getStoredRecentDocuments()

    if (!window.marktext) {
      status.value = 'Browser preview mode: preload bridge unavailable.'
      return
    }

    bootstrap.value = await window.marktext.app.getBootstrap()
  }

  const replaceActiveDocument = (document: EditorTab) => {
    const current = activeDocument.value
    if (!current) {
      tabs.value = [document]
      activeTabId.value = document.id
      setEditorMode()
      return
    }

    tabs.value = tabs.value.map(tab => tab.id === current.id ? document : tab)
    activeTabId.value = document.id
    setEditorMode()
  }

  const shouldReplaceActivePlaceholder = () => {
    const current = activeDocument.value
    return Boolean(
      current &&
      tabs.value.length === 1 &&
      !current.pathname &&
      !current.dirty
    )
  }

  const openPreparedDocument = (document: EditorTab, statusText: string) => {
    const existing = document.pathname
      ? tabs.value.find(tab => tab.pathname === document.pathname)
      : null

    if (existing) {
      activeTabId.value = existing.id
      status.value = `Focused ${existing.filename}`
      setEditorMode()
      return
    }

    if (shouldReplaceActivePlaceholder()) {
      replaceActiveDocument(document)
    } else {
      tabs.value.push(document)
      activeTabId.value = document.id
      setEditorMode()
    }

    status.value = statusText
  }

  const createTab = () => {
    untitledSequence.value += 1
    const document = createUntitledDocument(untitledSequence.value)

    if (shouldReplaceActivePlaceholder()) {
      replaceActiveDocument(document)
    } else {
      tabs.value.push(document)
      activeTabId.value = document.id
      setEditorMode()
    }

    status.value = `Created ${document.filename}`
  }

  const openSampleDocument = () => {
    const sample = createDefaultSampleDocument()
    openPreparedDocument(sample, 'Opened example.md')
  }

  const openDocument = async () => {
    if (!window.marktext) {
      status.value = 'Open is unavailable outside the Electron shell.'
      return
    }

    const openedDocument = await window.marktext.files.openMarkdown()
    if (!openedDocument) {
      return
    }

    const document = normalizeOpenedDocument(openedDocument)
    openPreparedDocument(document, `Opened ${document.filename}`)
    addRecentDocument(document)
  }

  const reopenRecentDocument = async (pathname: string) => {
    if (!window.marktext) {
      status.value = 'Reopen is unavailable outside the Electron shell.'
      return
    }

    const openedDocument = await window.marktext.files.openMarkdownAtPath(pathname)
    if (!openedDocument) {
      recentDocuments.value = recentDocuments.value.filter(item => item.pathname !== pathname)
      setStoredRecentDocuments(recentDocuments.value)
      status.value = 'Recent file could not be opened.'
      return
    }

    const document = normalizeOpenedDocument(openedDocument)
    openPreparedDocument(document, `Opened ${document.filename}`)
    addRecentDocument(document)
  }

  const saveActiveDocument = async () => {
    if (!window.marktext) {
      status.value = 'Save is unavailable outside the Electron shell.'
      return
    }

    const current = activeDocument.value
    if (!current) return

    const result = await window.marktext.files.saveMarkdown({
      pathname: current.pathname,
      filename: current.filename,
      markdown: current.markdown
    })

    if (!result) {
      return
    }

    const nextDocument: EditorDocument = {
      ...current,
      id: result.pathname,
      pathname: result.pathname,
      filename: result.filename,
      dirty: false
    }

    tabs.value = tabs.value.map(tab => {
      if (tab.id !== current.id) {
        return tab
      }

      return {
        ...tab,
        ...nextDocument,
        kind: 'file' as const,
        savedMarkdown: current.markdown
      }
    })
    activeTabId.value = nextDocument.id
    addRecentDocument({
      ...current,
      ...nextDocument
    })
    status.value = `Saved ${result.filename}`
    setEditorMode()
  }

  const updateActiveMarkdown = (markdown: string) => {
    const current = activeDocument.value
    if (!current) return

    tabs.value = tabs.value.map(tab => {
      if (tab.id !== current.id) return tab
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

  const applyActiveEditorState = (payload: EditorChangePayload) => {
    const current = activeDocument.value
    if (!current) return

    tabs.value = tabs.value.map(tab => {
      if (tab.id !== current.id) {
        return tab
      }

      const markdown = payload.markdown
      const summary = summarizeMarkdown(markdown)
      const headings = payload.toc?.map(item => ({
        depth: item.lvl,
        text: item.content
      })) ?? summary.headings

      return {
        ...tab,
        markdown,
        dirty: markdown !== tab.savedMarkdown,
        headings,
        lineCount: summary.lineCount,
        wordCount: payload.wordCount ?? summary.wordCount,
        cursor: payload.cursor ?? tab.cursor,
        history: payload.history ?? tab.history,
        toc: payload.toc ?? tab.toc
      }
    })
  }

  const closeTab = (id: string) => {
    const index = tabs.value.findIndex(item => item.id === id)
    if (index === -1) return

    const tab = tabs.value[index]
    if (tab.dirty) {
      const shouldClose = window.confirm(`Close ${tab.filename} without saving?`)
      if (!shouldClose) return
    }

    const nextTabs = tabs.value.filter(item => item.id !== id)
    tabs.value = nextTabs

    if (nextTabs.length === 0) {
      activeTabId.value = null
      viewMode.value = 'home'
      status.value = `Closed ${tab.filename}`
      return
    }

    if (activeTabId.value === id) {
      activeTabId.value = nextTabs[Math.min(index, nextTabs.length - 1)].id
    }

    setEditorMode()
    status.value = `Closed ${tab.filename}`
  }

  return {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    activeDocument,
    hasOpenDocument,
    recentDocuments,
    status,
    headings,
    wordCount,
    lineCount,
    loadBootstrap,
    createTab,
    setActiveTab,
    openDocument,
    openSampleDocument,
    reopenRecentDocument,
    saveActiveDocument,
    updateActiveMarkdown,
    applyActiveEditorState,
    closeTab
  }
})
