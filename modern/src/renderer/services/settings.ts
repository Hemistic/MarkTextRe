import type {
  SettingsPatch,
  SettingsPathPickerKind,
  SettingsState
} from '@shared/contracts'
import { invokeSettingsAction } from './settingsApi'

export const fetchSettingsState = async (): Promise<SettingsState | null> => {
  return invokeSettingsAction((settings) => settings.getState(), null)
}

export const updateSettingsState = async (patch: SettingsPatch): Promise<SettingsState | null> => {
  return invokeSettingsAction((settings) => settings.updateState(patch), null)
}

export const pickSettingsPath = async (
  kind: SettingsPathPickerKind,
  currentPath?: string | null
): Promise<string | null> => {
  return invokeSettingsAction((settings) => settings.pickPath(kind, currentPath), null)
}
