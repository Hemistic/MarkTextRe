import { computed, ref } from 'vue'
import type { AppBootstrap, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorChangePayload, EditorTab } from './types'
import {
  DEFAULT_STATUS,
  applyEditorPayloadToTab,
  updateTabMarkdown
} from './document'
import { setupEditorEffects } from './effects'
import { loadEditorBootstrapIntoState } from './bootstrap'
import {
  closeDocumentTabInState,
  openDocumentInState,
  reopenRecentDocumentInState,
  saveAllDirtyDocumentsInState,
  saveDocumentInState
} from './commands'
import {
  createTabInState,
  openSampleDocumentInState,
  setFocusedTabInState
} from './state'
import { resolveActiveDocument } from './workspace'
import { fetchRecentDocuments } from '../../services/files'

export const createEditorStoreRuntime = () => {
  const bootstrap = ref<AppBootstrap | null>(null)
  const viewMode = ref<EditorViewMode>('home')
  const tabs = ref<EditorTab[]>([])
  const activeTabId = ref<string | null>(null)
  const untitledSequence = ref(1)
  const recentDocuments = ref<RecentDocument[]>([])
  const status = ref(DEFAULT_STATUS)
  const bootstrapLoaded = ref(false)

  const activeDocument = computed(() => resolveActiveDocument(tabs.value, activeTabId.value))
  const hasOpenDocument = computed(() => activeDocument.value !== null)
  const hasDirtyDocuments = computed(() => tabs.value.some(tab => tab.dirty))
  const headings = computed(() => activeDocument.value?.headings ?? [])
  const wordCount = computed(() => activeDocument.value?.wordCount.word ?? 0)
  const lineCount = computed(() => activeDocument.value?.lineCount ?? 1)

  const refreshRecentDocuments = async () => {
    recentDocuments.value = await fetchRecentDocuments()
  }

  const setActiveTab = (id: string) => {
    setFocusedTabInState(tabs, activeTabId, viewMode, status, id)
  }

  const loadBootstrap = async () => {
    await loadEditorBootstrapIntoState({
      bootstrap,
      viewMode,
      tabs,
      activeTabId,
      untitledSequence,
      recentDocuments,
      status,
      bootstrapLoaded
    }, hasDirtyDocuments)
  }

  const commandState = {
    tabs,
    activeDocument,
    activeTabId,
    viewMode,
    recentDocuments,
    status
  }

  const openDocument = async () => {
    await openDocumentInState(commandState, refreshRecentDocuments)
  }

  const reopenRecentDocument = async (pathname: string) => {
    await reopenRecentDocumentInState(commandState, refreshRecentDocuments, pathname)
  }

  const openDocumentAtPath = async (pathname: string) => {
    await reopenRecentDocument(pathname)
  }

  const saveDocument = async (id: string, saveAs = false) => {
    return saveDocumentInState(commandState, refreshRecentDocuments, id, saveAs)
  }

  const saveAllDirtyDocuments = async () => {
    return saveAllDirtyDocumentsInState(commandState, refreshRecentDocuments)
  }

  const closeTab = async (id: string) => {
    await closeDocumentTabInState(commandState, refreshRecentDocuments, id)
  }

  const openSampleDocument = () => {
    openSampleDocumentInState(
      tabs,
      activeDocument,
      activeTabId,
      viewMode,
      status
    )
  }

  const createTab = () => {
    createTabInState(tabs, activeDocument, activeTabId, viewMode, untitledSequence, status)
  }

  const saveActiveDocument = async () => {
    if (!activeTabId.value) return
    await saveDocument(activeTabId.value)
  }

  const saveActiveDocumentAs = async () => {
    if (!activeTabId.value) return
    await saveDocument(activeTabId.value, true)
  }

  const updateActiveMarkdown = (markdown: string) => {
    const current = activeDocument.value
    if (!current) return

    tabs.value = updateTabMarkdown(tabs.value, current.id, markdown)
  }

  const applyActiveEditorState = (payload: EditorChangePayload) => {
    const current = activeDocument.value
    if (!current) return

    tabs.value = applyEditorPayloadToTab(tabs.value, current.id, payload)
  }

  setupEditorEffects({
    bootstrapLoaded,
    viewMode,
    tabs,
    activeTabId,
    untitledSequence,
    hasDirtyDocuments,
    saveAllDirtyDocuments
  })

  return {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    activeDocument,
    hasOpenDocument,
    hasDirtyDocuments,
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
    openDocumentAtPath,
    saveActiveDocument,
    saveActiveDocumentAs,
    updateActiveMarkdown,
    applyActiveEditorState,
    closeTab,
    saveAllDirtyDocuments
  }
}
