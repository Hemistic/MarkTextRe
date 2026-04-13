import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  SettingsPatch,
  SettingsPathPickerKind,
  SettingsState
} from '@shared/contracts'
import { applySettingsRuntime } from '../features/settings/runtime'
import {
  fetchSettingsState,
  pickSettingsPath,
  updateSettingsState
} from '../services/settings'

export const useSettingsStore = defineStore('settings', () => {
  const state = ref<SettingsState | null>(null)
  const ready = ref(false)
  const revision = ref(0)
  const pending = ref(false)

  const initialize = async () => {
    if (ready.value) {
      return state.value
    }

    const nextState = await fetchSettingsState()
    if (nextState) {
      state.value = nextState
      applySettingsRuntime(nextState)
    }

    revision.value += 1
    ready.value = true
    return state.value
  }

  const applyState = (nextState: SettingsState | null) => {
    if (!nextState) {
      return null
    }

    state.value = nextState
    revision.value += 1
    applySettingsRuntime(nextState)
    return nextState
  }

  const update = async (patch: SettingsPatch) => {
    pending.value = true
    try {
      return applyState(await updateSettingsState(patch))
    } finally {
      pending.value = false
    }
  }

  const updateField = async <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    return update({ [key]: value } as SettingsPatch)
  }

  const browsePath = async <K extends keyof SettingsState>(
    key: K,
    kind: SettingsPathPickerKind
  ) => {
    const selected = await pickSettingsPath(kind, typeof state.value?.[key] === 'string' ? state.value[key] as string : null)
    if (!selected) {
      return null
    }

    return updateField(key, selected as SettingsState[K])
  }

  return {
    initialize,
    pending,
    ready: computed(() => ready.value),
    revision: computed(() => revision.value),
    state: computed(() => state.value),
    update,
    updateField,
    browsePath
  }
})
