import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useLegacyTitleBar } from './useLegacyTitleBar'

describe('useLegacyTitleBar', () => {
  it('derives path segments and platform fallback', () => {
    const pathname = ref('D:/docs/notes/example.md')
    const platform = ref<string | null>(null)

    const titleBar = useLegacyTitleBar(pathname, computed(() => platform.value))

    expect(titleBar.pathSegments.value).toEqual(['D:', 'docs', 'notes'])
    expect(titleBar.platform.value).toBe('win32')

    platform.value = 'darwin'
    expect(titleBar.platform.value).toBe('darwin')
  })

  it('cycles metrics in the expected order', () => {
    const titleBar = useLegacyTitleBar(ref(null), ref('win32'))

    expect(titleBar.currentMetric.value).toBe('word')
    titleBar.cycleMetric()
    expect(titleBar.currentMetric.value).toBe('paragraph')
    titleBar.cycleMetric()
    expect(titleBar.currentMetric.value).toBe('character')
    titleBar.cycleMetric()
    expect(titleBar.currentMetric.value).toBe('all')
    titleBar.cycleMetric()
    expect(titleBar.currentMetric.value).toBe('word')
  })
})
