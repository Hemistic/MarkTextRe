import type { EditorChangePayload } from './types'
import { useSettingsStore } from '../../stores/settings'
import {
  openFolder,
  openFolderAtPath as openFolderTreeAtPath,
  openFolderAtPathInNewWindow,
  openFolderInNewWindow,
  openMarkdownAtPath,
  openMarkdownAtPathInNewWindow,
  openMarkdownInNewWindow,
  pickOpenPaths
} from '../../services/files'
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
  setStatusInState,
  setFocusedTabInState
} from './state'
import type { EditorRuntimeState } from './runtimeState'
import {
  applyActiveDocumentEditorPayload,
  createSaveActiveDocumentAction,
  updateActiveDocumentMarkdown
} from './actionsSupport'
import { sortProjectTree } from './projectTreeSortSupport'
import { normalizeOpenedDocument } from './document'
import { openTrackedDocumentInState } from './commandsSupport'

export const createEditorActions = (state: EditorRuntimeState) => {
  const {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    untitledSequence,
    recentDocuments,
    projectTree,
    status,
    bootstrapLoaded,
    activeDocument,
    hasDirtyDocuments,
    commandState,
    refreshRecentDocuments
  } = state
  const settings = useSettingsStore()

  const setActiveTab = (id: string) => {
    setFocusedTabInState(tabs, activeTabId, viewMode, status, id)
  }

  const applyOpenedFolder = (pathname: string, nextProjectTree: NonNullable<typeof projectTree.value>) => {
    sortProjectTree(nextProjectTree, settings.state?.fileSortBy ?? 'created')
    projectTree.value = nextProjectTree
    viewMode.value = 'editor'
    setStatusInState(status, `Opened folder ${nextProjectTree.name || pathname}`)
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
    }, hasDirtyDocuments, undefined, settings.state
      ? {
          defaultDirectoryToOpen: settings.state.defaultDirectoryToOpen,
          startUpAction: settings.state.startUpAction
        }
      : null)

    if (
      settings.state?.startUpAction === 'folder' &&
      settings.state.defaultDirectoryToOpen &&
      !projectTree.value
    ) {
      const nextProjectTree = await openFolderTreeAtPath(settings.state.defaultDirectoryToOpen)
      if (nextProjectTree) {
        applyOpenedFolder(settings.state.defaultDirectoryToOpen, nextProjectTree)
      }
    }
  }

  const openDocument = async () => {
    if (settings.state?.openFilesInNewWindow) {
      const opened = await openMarkdownInNewWindow()
      if (opened) {
        await refreshRecentDocuments()
        setStatusInState(status, 'Opened file in a new window')
      }
      return
    }

    await openDocumentInState(commandState, refreshRecentDocuments)
  }

  const openPath = async () => {
    const selections = await pickOpenPaths()
    if (selections.length === 0) {
      return
    }

    const folderSelection = selections.find(selection => selection.kind === 'folder')

    if (folderSelection) {
      if (settings.state?.openFolderInNewWindow) {
        const opened = await openFolderAtPathInNewWindow(folderSelection.pathname)
        if (opened) {
          setStatusInState(status, 'Opened folder in a new window')
        }
      } else {
        await openFolderAtPath(folderSelection.pathname)
      }
    }

    const fileSelections = selections.filter(selection => selection.kind === 'file')
    if (fileSelections.length === 0) {
      return
    }

    if (fileSelections.length === 1 && settings.state?.openFilesInNewWindow) {
      const opened = await openMarkdownAtPathInNewWindow(fileSelections[0].pathname)
      if (opened) {
        await refreshRecentDocuments()
        const filename = fileSelections[0].pathname.split(/[\\/]/).pop() ?? fileSelections[0].pathname
        setStatusInState(status, `Opened ${filename} in a new window`)
      }
      return
    }

    let openedCount = 0

    for (const selection of fileSelections) {
      const document = await openMarkdownAtPath(selection.pathname)
      if (!document) {
        continue
      }

      await openTrackedDocumentInState(commandState, refreshRecentDocuments, normalizeOpenedDocument(document))
      openedCount += 1
    }

    if (openedCount > 1) {
      setStatusInState(status, `Opened ${openedCount} files`)
    }
  }

  const reopenRecentDocument = async (pathname: string) => {
    if (settings.state?.openFilesInNewWindow) {
      const opened = await openMarkdownAtPathInNewWindow(pathname)
      if (opened) {
        await refreshRecentDocuments()
        const filename = pathname.split(/[\\/]/).pop() ?? pathname
        setStatusInState(status, `Opened ${filename} in a new window`)
        return
      }
    }

    await reopenRecentDocumentInState(commandState, refreshRecentDocuments, pathname)
  }

  const openDocumentAtPath = async (pathname: string) => {
    await reopenRecentDocumentInState(commandState, refreshRecentDocuments, pathname)
  }

  const openFolderAtPath = async (pathname: string) => {
    const nextProjectTree = await openFolderTreeAtPath(pathname)
    if (!nextProjectTree) {
      return false
    }

    applyOpenedFolder(pathname, nextProjectTree)
    return true
  }

  const openFolderFromDialog = async () => {
    if (settings.state?.openFolderInNewWindow) {
      const opened = await openFolderInNewWindow()
      if (opened) {
        setStatusInState(status, 'Opened folder in a new window')
      }
      return
    }

    const nextProjectTree = await openFolder()
    if (!nextProjectTree) {
      return
    }

    applyOpenedFolder(nextProjectTree.pathname, nextProjectTree)
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
    await createSaveActiveDocumentAction(activeTabId, saveDocument)()
  }

  const saveActiveDocumentAs = async () => {
    await createSaveActiveDocumentAction(activeTabId, saveDocument, true)()
  }

  const updateActiveMarkdown = (markdown: string) => {
    updateActiveDocumentMarkdown(activeDocument, markdown)
  }

  const applyActiveEditorState = (payload: EditorChangePayload) => {
    applyActiveDocumentEditorPayload(activeDocument, payload)
  }

  return {
    setActiveTab,
    loadBootstrap,
    openDocument,
    openPath,
    reopenRecentDocument,
    openDocumentAtPath,
    openFolderAtPath,
    openFolder: openFolderFromDialog,
    saveDocument,
    saveAllDirtyDocuments,
    closeTab,
    openSampleDocument,
    createTab,
    saveActiveDocument,
    saveActiveDocumentAs,
    updateActiveMarkdown,
    applyActiveEditorState
  }
}
