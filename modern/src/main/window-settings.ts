import type { BrowserWindow } from 'electron'
import type { SettingsState } from '@shared/contracts'

const resolveSpellcheckEnabled = (settings: SettingsState) => {
  return settings.spellcheckerEnabled && !settings.spellcheckerNoUnderline
}

export const applyWindowSettings = (
  window: Pick<BrowserWindow, 'webContents'>,
  settings: SettingsState
) => {
  window.webContents.setZoomFactor(settings.zoom)

  const { session } = window.webContents
  session.setSpellCheckerEnabled(resolveSpellcheckEnabled(settings))

  if (process.platform === 'darwin') {
    return
  }

  const languages = session.availableSpellCheckerLanguages
  if (languages.includes(settings.spellcheckerLanguage)) {
    session.setSpellCheckerLanguages([settings.spellcheckerLanguage])
  }
}
