type BrowserProcess = {
  env: Record<string, string | undefined>
  argv: string[]
  browser: boolean
  cwd: () => string
  nextTick: (callback: (...args: unknown[]) => void, ...args: unknown[]) => void
  platform: string
  release: {
    name: string
  }
  versions: Record<string, string>
}

const processShim: BrowserProcess = {
  env: {},
  argv: [],
  browser: true,
  cwd: () => '/',
  nextTick: (callback, ...args) => {
    queueMicrotask(() => {
      callback(...args)
    })
  },
  platform: 'browser',
  release: {
    name: 'browser'
  },
  versions: {}
}

if (typeof globalThis.process === 'undefined') {
  globalThis.process = processShim as typeof globalThis.process
}

if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis
}

export default globalThis.process
