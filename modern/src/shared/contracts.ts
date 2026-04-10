export interface AppBootstrap {
  appName: string
  platform: NodeJS.Platform
  versions: {
    chrome: string
    electron: string
    node: string
    v8: string
  }
}

export interface EditorDocument {
  id: string
  pathname: string | null
  filename: string
  markdown: string
  dirty: boolean
}

export interface SaveDocumentInput {
  pathname: string | null
  filename: string
  markdown: string
}

export interface SaveDocumentResult {
  pathname: string
  filename: string
}

export interface MarkTextApi {
  app: {
    getBootstrap: () => Promise<AppBootstrap>
  }
  files: {
    openMarkdown: () => Promise<EditorDocument | null>
    openMarkdownAtPath: (pathname: string) => Promise<EditorDocument | null>
    saveMarkdown: (input: SaveDocumentInput) => Promise<SaveDocumentResult | null>
  }
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
  }
}
