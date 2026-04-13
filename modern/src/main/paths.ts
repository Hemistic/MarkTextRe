import path from 'node:path'
import { app } from 'electron'

export const recentDocumentsPath = () => path.join(app.getPath('userData'), 'recent-documents.json')

export const sessionStatePath = () => path.join(app.getPath('userData'), 'session-state.json')

export const settingsStatePath = () => path.join(app.getPath('userData'), 'settings.json')

export const windowStatePath = () => path.join(app.getPath('userData'), 'window-state.json')
