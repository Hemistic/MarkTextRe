export const IPC_CHANNELS = {
  app: {
    getBootstrap: 'marktext:app:get-bootstrap',
    setDirtyState: 'marktext:app:set-dirty-state',
    getSessionState: 'marktext:app:get-session-state',
    setSessionState: 'marktext:app:set-session-state',
    confirmCloseDocument: 'marktext:app:confirm-close-document',
    command: 'marktext:app:command',
    windowCloseRequest: 'marktext:app:window-close-request',
    windowCloseResponse: 'marktext:app:window-close-response'
  },
  files: {
    getRecentDocuments: 'marktext:files:get-recent-documents',
    removeRecentDocument: 'marktext:files:remove-recent-document',
    openMarkdown: 'marktext:files:open-markdown',
    openMarkdownAtPath: 'marktext:files:open-markdown-at-path',
    saveMarkdown: 'marktext:files:save-markdown',
    saveMarkdownAs: 'marktext:files:save-markdown-as'
  },
  window: {
    minimize: 'marktext:window:minimize',
    maximize: 'marktext:window:maximize',
    close: 'marktext:window:close'
  }
} as const
