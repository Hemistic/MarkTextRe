export declare const hasCursorEdgeKey: (edge: unknown) => boolean
export declare const hasCursorRangeKeys: (cursorRange: unknown) => boolean
export declare const normalizeCursorRange: (cursorRange: unknown) => {
  anchor: unknown,
  focus: unknown,
  start: unknown,
  end: unknown
} | null
export declare const resolveActiveCursorRange: (
  contentState: { getBlock: (key: string) => unknown, cursor?: unknown } | null | undefined,
  cursorRange: unknown
) => {
  anchor: unknown,
  focus: unknown,
  start: unknown,
  end: unknown,
  startBlock: unknown,
  endBlock: unknown
} | null
export declare const resolveCursorRangeBlocks: (
  contentState: { getBlock: (key: string) => unknown } | null | undefined,
  cursorRange: unknown
) => {
  anchor: unknown,
  focus: unknown,
  start: unknown,
  end: unknown,
  startBlock: unknown,
  endBlock: unknown
} | null
