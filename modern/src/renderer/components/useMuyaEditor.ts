import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { SettingsState } from '@shared/contracts'
import type { EditorChangePayload } from '../features/editor/types'
import { createMuyaEditor, getMuyaErrorMessage } from '../features/muya/bridge'
import type { MuyaEditorInstance } from '../features/muya/types'
import {
  createMuyaSyncState,
  handleMuyaChange,
  restoreMuyaFromModel,
  shouldSyncMuyaFromModel
} from '../features/muya/sync'
import { resolveDiagramThemes } from '../features/muya/editorOptions'
import * as muyaOptionSupport from 'legacy-muya/lib/muyaOptionSupport.js'

const {
  setMuyaFont,
  setMuyaListIndentation,
  setMuyaOptions,
  setMuyaTabSize
} = muyaOptionSupport as unknown as {
  setMuyaFont: (editor: MuyaEditorInstance, options: { fontSize?: number, lineHeight?: number }) => void
  setMuyaListIndentation: (editor: MuyaEditorInstance, listIndentation: SettingsState['listIndentation']) => void
  setMuyaOptions: (editor: MuyaEditorInstance, options: Record<string, unknown>, needRender?: boolean) => void
  setMuyaTabSize: (editor: MuyaEditorInstance, tabSize: number) => void
}

type MuyaEditorProps = {
  modelValue: string
  pathname?: string | null
  workspaceRootPath?: string | null
  cursor?: unknown
  history?: unknown
  settings?: SettingsState | null
}

type MuyaEditorEmitter = {
  updateModelValue: (value: string) => void
  editorChange: (payload: EditorChangePayload) => void
}

export const useMuyaEditor = (
  host: Ref<HTMLElement | null>,
  props: MuyaEditorProps,
  emit: MuyaEditorEmitter
) => {
  const loadError = ref('')
  let editor: MuyaEditorInstance | null = null
  const syncState = createMuyaSyncState(props.modelValue)

  const getDirname = (pathnameValue?: string | null) => {
    if (!pathnameValue) {
      return ''
    }

    const normalized = pathnameValue.replace(/\\/g, '/')
    const lastSlashIndex = normalized.lastIndexOf('/')

    if (lastSlashIndex <= 0) {
      return normalized
    }

    return normalized.slice(0, lastSlashIndex)
  }

  const syncRuntimeDirname = (pathnameValue?: string | null) => {
    globalThis.DIRNAME = getDirname(pathnameValue)
  }

  const restoreEditorState = (markdown: string, cursor?: unknown, history?: unknown) => {
    if (!editor) return

    restoreMuyaFromModel(editor, syncState, markdown, cursor, history)
  }

  const applySettings = (settings?: SettingsState | null) => {
    if (!editor || !settings) {
      return
    }

    const { mermaidTheme, vegaTheme } = resolveDiagramThemes(settings.theme)

    setMuyaOptions(editor, {
      autoCheck: settings.autoCheck,
      autoPairBracket: settings.autoPairBracket,
      autoPairMarkdownSyntax: settings.autoPairMarkdownSyntax,
      autoPairQuote: settings.autoPairQuote,
      bulletListMarker: settings.bulletListMarker,
      codeBlockLineNumbers: settings.codeBlockLineNumbers,
      disableHtml: !settings.isHtmlEnabled,
      footnote: settings.footnote,
      frontmatterType: settings.frontmatterType,
      hideLinkPopup: settings.hideLinkPopup,
      hideQuickInsertHint: settings.hideQuickInsertHint,
      isGitlabCompatibilityEnabled: settings.isGitlabCompatibilityEnabled,
      mermaidTheme,
      orderListDelimiter: settings.orderListDelimiter,
      preferLooseListItem: settings.preferLooseListItem,
      sequenceTheme: settings.sequenceTheme,
      spellcheckEnabled: settings.spellcheckerEnabled && !settings.spellcheckerNoUnderline,
      superSubScript: settings.superSubScript,
      trimUnnecessaryCodeBlockEmptyLines: settings.trimUnnecessaryCodeBlockEmptyLines,
      vegaTheme
    }, true)
    setMuyaFont(editor, {
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight
    })
    setMuyaTabSize(editor, settings.tabSize)
    setMuyaListIndentation(editor, settings.listIndentation)
  }

  onMounted(async () => {
    if (!host.value) return

    syncRuntimeDirname(props.pathname)

    try {
      editor = await createMuyaEditor({
        host: host.value,
        markdown: props.modelValue,
        pathname: props.pathname,
        workspaceRootPath: props.workspaceRootPath,
        cursor: props.cursor,
        history: props.history,
        settings: props.settings ?? undefined,
        onChange: (payload: EditorChangePayload) => {
          const result = handleMuyaChange(syncState, payload, props.modelValue)
          emit.editorChange(payload)
          if (result.shouldEmitModelUpdate) {
            emit.updateModelValue(result.markdown)
          }
        }
      })
      applySettings(props.settings)
    } catch (error) {
      loadError.value = getMuyaErrorMessage(error)
      console.error('[modern] failed to initialize Muya', error)
    }
  })

  watch(
    () => props.pathname,
    pathnameValue => {
      syncRuntimeDirname(pathnameValue)
    },
    { immediate: true }
  )

  watch(
    () => props.modelValue,
    markdown => {
      if (!shouldSyncMuyaFromModel(editor, markdown, syncState)) return

      restoreEditorState(markdown, props.cursor, props.history)
    }
  )

  watch(
    () => props.settings,
    settings => {
      applySettings(settings)
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    editor?.destroy?.()
    editor = null
    globalThis.DIRNAME = ''
  })

  return {
    loadError,
    editorRef: () => editor,
    restoreEditorState
  }
}
