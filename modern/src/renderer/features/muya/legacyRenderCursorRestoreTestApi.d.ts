export declare const applyResolvedRenderCursorAction: (
  contentState: unknown,
  action: 'restore' | 'blur' | 'skip',
  restoreCursor: (contentState: unknown) => unknown,
  blurContentState: (contentState: unknown) => unknown
) => 'restore' | 'blur' | 'skip'
export declare const hasCursorEndpoints: (cursor: unknown) => boolean
export declare const normalizeCursorEndpoints: (cursor: unknown) => {
  anchor: unknown
  focus: unknown
  start: unknown
  end: unknown
} | null
export declare const hasCursorBlocks: (contentState: unknown, cursor?: unknown) => boolean
export declare const isSelectionRootCompatible: (
  selectionRoot: unknown,
  editor: { contains?: (node: unknown) => boolean } | null | undefined
) => boolean
export declare const getCursorRestoreContext: (contentState: unknown) => {
  renderContainer: unknown
  editor: unknown
  selectionRoot: unknown
}
export declare const shouldRestoreContentCursor: (contentState: unknown) => boolean
export declare const resolveRenderCursorAction: (
  contentState: unknown,
  isRenderCursor?: boolean
) => 'restore' | 'blur' | 'skip'
