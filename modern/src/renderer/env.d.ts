/// <reference types="vite/client" />

import type { MarkTextApi } from '@shared/contracts'

declare module '*.vue' {
  const component: any
  export default component
}

declare global {
  var DIRNAME: string

  interface Window {
    DIRNAME: string
    marktext: MarkTextApi
  }
}

export {}
