export declare const resolveEnterCursorTarget: (cursorBlock: unknown) => unknown
export declare const isCursorWithinBlock: (
  contentState: unknown,
  rootBlock: unknown,
  cursor?: unknown
) => boolean
export declare const shouldPreserveCodeBlockEnterCursor: (
  contentState: unknown,
  blockNeedFocus: unknown,
  block: unknown,
  getParagraphBlock: (block: unknown) => unknown
) => boolean
export declare const resolveHtmlEnterOffset: (cursorBlock: { text?: string } | null | undefined) => number
