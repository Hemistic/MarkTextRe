export declare const canRestoreCursorRange: (
  cursorRange: unknown,
  anchorParagraph: unknown,
  focusParagraph: unknown
) => boolean
export declare const clampSelectionOffset: (node: unknown, offset: number) => number
export declare const normalizeSelectionTargets: (
  anchorNode: unknown,
  anchorOffset: number,
  focusNode: unknown,
  focusOffset: number
) => {
  anchorNode: unknown
  anchorOffset: number
  focusNode: unknown
  focusOffset: number
} | null
export declare const safeApplySelectionRange: (selection: unknown, range: unknown) => boolean
export declare const safeSetSelectionFocus: (
  selection: unknown,
  focusNode: unknown,
  focusOffset: number,
  doc: { createRange: () => unknown },
  selectRange: (range: unknown) => unknown
) => boolean
