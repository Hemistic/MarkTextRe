export const sanitizeForIpc = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (value == null) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'undefined') {
    return null
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeForIpc(item, seen))
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof Element !== 'undefined' && value instanceof Element) {
    return null
  }

  if (typeof Node !== 'undefined' && value instanceof Node) {
    return null
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return null
    }

    seen.add(value)

    if (ArrayBuffer.isView(value)) {
      const view = value as ArrayBufferView<ArrayBufferLike>
      return Array.from(new Uint8Array(view.buffer, view.byteOffset, view.byteLength))
    }

    if (value instanceof ArrayBuffer) {
      return Array.from(new Uint8Array(value))
    }

    if (typeof (value as { toJSON?: () => unknown }).toJSON === 'function') {
      return sanitizeForIpc((value as { toJSON: () => unknown }).toJSON(), seen)
    }

    const entries = Object.entries(value as Record<string, unknown>)
    const sanitized = Object.fromEntries(
      entries.map(([key, item]) => [key, sanitizeForIpc(item, seen)])
    )
    seen.delete(value)
    return sanitized
  }

  return null
}
