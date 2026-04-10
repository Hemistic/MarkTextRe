export const IPC_CHANNELS = {
  app: {
    getBootstrap: 'marktext:app:get-bootstrap'
  },
  files: {
    openMarkdown: 'marktext:files:open-markdown',
    openMarkdownAtPath: 'marktext:files:open-markdown-at-path',
    saveMarkdown: 'marktext:files:save-markdown'
  },
  window: {
    minimize: 'marktext:window:minimize',
    maximize: 'marktext:window:maximize',
    close: 'marktext:window:close'
  }
} as const
