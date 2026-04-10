/// <reference types="vite/client" />

import type { MarkTextApi } from '@shared/contracts'

declare module '*.vue' {
  const component: any
  export default component
}

declare module 'legacy-muya/*' {
  const value: any
  export default value
}

declare module 'legacy-muya/lib/index.js' {
  const value: any
  export default value
}

declare global {
  interface Window {
    marktext: MarkTextApi
  }
}

export {}
