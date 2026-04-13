import type { App, BrowserWindow } from 'electron'

type EnqueueOpenPath = (pendingOpenPaths: string[], pathname: string) => void
type EnsureWindow = () => Promise<BrowserWindow>
type AttachWindow = (window: BrowserWindow) => void
type ActivateWindow = (window: BrowserWindow) => void
type ExtractOpenablePaths = (argv: string[]) => Promise<string[]>

interface QueueOpenPathOptions {
  activateWindow: ActivateWindow
  appReady: () => boolean
  attachWindow: AttachWindow
  ensureWindow: EnsureWindow
  enqueuePath: EnqueueOpenPath
}

interface CaptureStartupPathsOptions {
  enqueuePath: EnqueueOpenPath
  extractOpenablePaths: ExtractOpenablePaths
}

interface RegisterOpenPathEventsOptions {
  extractOpenablePaths: ExtractOpenablePaths
  queueOpenPath: (pathname: string) => void
}

export const queueOpenPathForApp = (
  pendingOpenPaths: string[],
  pathname: string,
  {
    activateWindow,
    appReady,
    attachWindow,
    ensureWindow,
    enqueuePath
  }: QueueOpenPathOptions
) => {
  enqueuePath(pendingOpenPaths, pathname)

  if (!appReady()) {
    return
  }

  void ensureWindow().then(window => {
    activateWindow(window)
    attachWindow(window)
  })
}

export const captureStartupOpenPaths = async (
  argv: string[],
  pendingOpenPaths: string[],
  {
    enqueuePath,
    extractOpenablePaths
  }: CaptureStartupPathsOptions
) => {
  const startupPaths = await extractOpenablePaths(argv)
  for (const pathname of startupPaths) {
    enqueuePath(pendingOpenPaths, pathname)
  }
}

export const registerOpenPathAppEvents = (
  app: Pick<App, 'on'>,
  {
    extractOpenablePaths,
    queueOpenPath
  }: RegisterOpenPathEventsOptions
) => {
  app.on('second-instance', (_event, argv) => {
    void extractOpenablePaths(argv).then(pathnames => {
      for (const pathname of pathnames) {
        queueOpenPath(pathname)
      }
    })
  })

  app.on('open-file', (event, pathname) => {
    const openFileEvent = event as { preventDefault: () => void }
    const openPathname = pathname as string

    openFileEvent.preventDefault()
    queueOpenPath(openPathname)
  })
}
