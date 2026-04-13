export declare const hasCursorEndpoints: (cursor: unknown) => boolean
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
