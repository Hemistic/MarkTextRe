declare module 'pako' {
  export function deflate(input: string, options?: { level?: number }): Uint8Array
}
