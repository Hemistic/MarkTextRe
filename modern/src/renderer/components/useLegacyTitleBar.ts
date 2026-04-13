import { computed, ref, type Ref } from 'vue'

const METRIC_ORDER = ['word', 'paragraph', 'character', 'all'] as const

export const TITLE_BAR_LABEL_MAP = {
  word: { short: 'W', full: 'word' },
  paragraph: { short: 'P', full: 'paragraph' },
  character: { short: 'C', full: 'character' },
  all: { short: 'A', full: 'character (all)' }
}

export const useLegacyTitleBar = (
  pathname: Readonly<Ref<string | null>>,
  platformValue: Readonly<Ref<string | null | undefined>>
) => {
  const currentMetric = ref<(typeof METRIC_ORDER)[number]>('word')

  const pathSegments = computed(() => {
    if (!pathname.value) return []

    return pathname.value
      .split(/[\\/]+/)
      .filter(Boolean)
      .slice(0, -1)
      .slice(-3)
  })

  const platform = computed(() => platformValue.value ?? 'win32')

  const cycleMetric = () => {
    const index = METRIC_ORDER.indexOf(currentMetric.value)
    currentMetric.value = METRIC_ORDER[(index + 1) % METRIC_ORDER.length]
  }

  return {
    currentMetric,
    cycleMetric,
    pathSegments,
    platform
  }
}
