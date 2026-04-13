type SnapGlobal = Window & typeof globalThis & {
  Snap?: unknown
}

const globalScope = globalThis as SnapGlobal

export default globalScope.Snap
