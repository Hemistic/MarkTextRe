import type { ComputedRef, Ref } from 'vue'
import type { EditorChangePayload, EditorTab } from './types'
import {
  applyEditorPayloadToTabInPlace,
  updateEditorTabMarkdownInPlace
} from './document'

export const runForActiveDocument = <T>(
  activeDocument: ComputedRef<EditorTab | null>,
  onDocument: (document: EditorTab) => T
): T | null => {
  const current = activeDocument.value
  if (!current) {
    return null
  }

  return onDocument(current)
}

export const createSaveActiveDocumentAction = <T>(
  activeTabId: Ref<string | null>,
  saveDocument: (id: string, saveAs?: boolean) => Promise<T>,
  saveAs = false
) => {
  return async () => {
    const id = activeTabId.value
    if (!id) {
      return null
    }

    return saveDocument(id, saveAs)
  }
}

export const updateActiveDocumentMarkdown = (
  activeDocument: ComputedRef<EditorTab | null>,
  markdown: string
) => {
  return runForActiveDocument(activeDocument, current => {
    return updateEditorTabMarkdownInPlace(current, markdown)
  })
}

export const applyActiveDocumentEditorPayload = (
  activeDocument: ComputedRef<EditorTab | null>,
  payload: EditorChangePayload
) => {
  return runForActiveDocument(activeDocument, current => {
    return applyEditorPayloadToTabInPlace(current, payload)
  })
}
