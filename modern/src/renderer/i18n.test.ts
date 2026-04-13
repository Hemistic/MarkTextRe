import { describe, expect, it } from 'vitest'
import { normalizeLocale, translateMessage, translateMetricShort } from './i18n-support'

describe('renderer i18n', () => {
  it('normalizes supported locales', () => {
    expect(normalizeLocale('en')).toBe('en')
    expect(normalizeLocale('zh-CN')).toBe('zh-CN')
    expect(normalizeLocale('zh')).toBe('zh-CN')
    expect(normalizeLocale('zh-Hans')).toBe('zh-CN')
  })

  it('translates known messages and falls back for unknown ones', () => {
    expect(translateMessage('zh-CN', 'Settings')).toBe('设置')
    expect(translateMessage('en', 'Settings')).toBe('Settings')
    expect(translateMessage('zh-CN', 'Unknown text')).toBe('Unknown text')
  })

  it('returns locale-specific metric abbreviations', () => {
    expect(translateMetricShort('en', 'word')).toBe('W')
    expect(translateMetricShort('zh-CN', 'word')).toBe('词')
  })
})
