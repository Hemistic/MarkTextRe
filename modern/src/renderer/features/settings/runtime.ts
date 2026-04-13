import type { SettingsState, ThemeName } from '@shared/contracts'
import darkThemeCss from '@legacy-assets/themes/dark.theme.css?raw'
import graphiteThemeCss from '@legacy-assets/themes/graphite.theme.css?raw'
import materialDarkThemeCss from '@legacy-assets/themes/material-dark.theme.css?raw'
import oneDarkThemeCss from '@legacy-assets/themes/one-dark.theme.css?raw'
import ulyssesThemeCss from '@legacy-assets/themes/ulysses.theme.css?raw'
import darkPrismThemeCss from '@legacy-assets/themes/prismjs/dark.theme.css?raw'
import oneDarkPrismThemeCss from '@legacy-assets/themes/prismjs/one-dark.theme.css?raw'
import { normalizeLocale } from '../../i18n-support'

const THEME_STYLE_ID = 'mt-modern-theme-style'
const COMMON_STYLE_ID = 'mt-modern-common-style'

const isDarkTheme = (theme: ThemeName) => {
  return ['dark', 'material-dark', 'one-dark'].includes(theme)
}

const resolveEffectiveTheme = (settings: SettingsState): ThemeName => {
  if (settings.autoSwitchTheme === 0 && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return settings.theme
}

const resolveThemeCss = (theme: ThemeName) => {
  switch (theme) {
    case 'dark':
      return `${darkThemeCss}\n${darkPrismThemeCss}`
    case 'graphite':
      return graphiteThemeCss
    case 'material-dark':
      return `${materialDarkThemeCss}\n${darkPrismThemeCss}`
    case 'one-dark':
      return `${oneDarkThemeCss}\n${oneDarkPrismThemeCss}`
    case 'ulysses':
      return ulyssesThemeCss
    default:
      return ''
  }
}

const upsertStyle = (id: string, cssText: string) => {
  let styleElement = document.getElementById(id) as HTMLStyleElement | null
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = id
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = cssText
}

const escapeFontFamily = (value: string) => {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

const createCommonCss = (settings: SettingsState) => {
  const maxWidthCss = settings.editorLineWidth
    ? `:root { --editorAreaWidth: calc(100px + ${settings.editorLineWidth}); }`
    : ':root { --editorAreaWidth: 750px; }'

  const scrollbarCss = settings.hideScrollbar ? '::-webkit-scrollbar { display: none; }' : ''
  const tocWrapCss = settings.wordWrapInToc
    ? '.toc-list .text-overflow { white-space: normal; overflow-wrap: anywhere; }'
    : '.toc-list .text-overflow { white-space: nowrap; }'

  return `
${maxWidthCss}
${scrollbarCss}
${tocWrapCss}
#ag-editor-id,
#ag-editor-id [contenteditable="true"] {
  font-family: "${escapeFontFamily(settings.editorFontFamily)}", "Clear Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: ${settings.fontSize}px;
  line-height: ${settings.lineHeight};
  direction: ${settings.textDirection};
}
#ag-editor-id code,
#ag-editor-id code[class*="language-"],
#ag-editor-id pre.ag-paragraph,
#ag-editor-id pre[class*="language-"] {
  font-family: "${escapeFontFamily(settings.codeFontFamily)}", "Source Code Pro", "Droid Sans Mono", Consolas, monospace;
  font-size: ${settings.codeFontSize}px;
}
`
}

export const applySettingsRuntime = (settings: SettingsState) => {
  if (typeof document === 'undefined') {
    return
  }

  const effectiveTheme = resolveEffectiveTheme(settings)
  upsertStyle(THEME_STYLE_ID, resolveThemeCss(effectiveTheme))
  upsertStyle(COMMON_STYLE_ID, createCommonCss(settings))

  document.body.classList.toggle('dark', isDarkTheme(effectiveTheme))
  document.documentElement.dataset.theme = effectiveTheme
  document.documentElement.lang = normalizeLocale(settings.language)
}
