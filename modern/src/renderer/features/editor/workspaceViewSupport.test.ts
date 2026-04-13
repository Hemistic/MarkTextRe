import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { EditorTab } from './types'
import { createEditorWorkspaceViewState, EMPTY_WORD_COUNT } from './workspaceViewSupport'

describe('workspaceViewSupport', () => {
  it('derives title fields, sidebar mode, and home visibility from workspace refs', () => {
    const activeDocument = computed<EditorTab>(() => ({
      id: 'tab-1',
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      markdown: '# Example\n',
      dirty: true,
      kind: 'file',
      savedMarkdown: '# Example\n',
      headings: [],
      lineCount: 1,
      wordCount: {
        word: 5,
        paragraph: 1,
        character: 10,
        all: 10
      },
      cursor: null,
      history: null,
      toc: []
    }))

    const viewState = createEditorWorkspaceViewState({
      activeDocument,
      activeTabId: ref('tab-1'),
      bootstrap: ref(null),
      headings: computed(() => []),
      recentDocuments: ref([]),
      tabs: ref([]),
      viewMode: ref('editor')
    })

    expect(viewState.sideBarMode.value).toBe('files')
    expect(viewState.titleFilename.value).toBe('example.md')
    expect(viewState.titlePathname.value).toBe('D:/docs/example.md')
    expect(viewState.titleDirty.value).toBe(true)
    expect(viewState.titleWordCount.value).toEqual({
      word: 5,
      paragraph: 1,
      character: 10,
      all: 10
    })
    expect(viewState.showHome.value).toBe(false)
  })

  it('falls back to empty title state when there is no active document', () => {
    const viewState = createEditorWorkspaceViewState({
      activeDocument: computed(() => null),
      activeTabId: ref(null),
      bootstrap: ref(null),
      headings: computed(() => []),
      recentDocuments: ref([]),
      tabs: ref([]),
      viewMode: ref('home')
    })

    expect(viewState.titleFilename.value).toBe('')
    expect(viewState.titlePathname.value).toBeNull()
    expect(viewState.titleDirty.value).toBe(false)
    expect(viewState.titleWordCount.value).toEqual(EMPTY_WORD_COUNT)
    expect(viewState.showHome.value).toBe(true)
  })
})
