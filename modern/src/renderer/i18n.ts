import { computed } from 'vue'
import { useSettingsStore } from './stores/settings'
import {
  normalizeLocale,
  translateMessage,
  translateMetricShort,
  type RendererLocale
} from './i18n-support'

export { normalizeLocale, translateMessage, translateMetricShort, type RendererLocale }

export const useI18n = () => {
  const settings = useSettingsStore()
  const locale = computed(() => normalizeLocale(settings.state?.language))

  const t = (message: string) => {
    return translateMessage(locale.value, message)
  }

  return {
    locale,
    t
  }
}
