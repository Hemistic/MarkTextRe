<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SettingsState } from '@shared/contracts'
import { useI18n } from '../i18n'
import {
  type PathFieldDescriptor,
  type RangeFieldDescriptor,
  type SelectFieldDescriptor,
  type SettingsFieldDescriptor,
  getSettingsCategory,
  settingsCategories
} from '../features/settings/schema'
import { useSettingsStore } from '../stores/settings'

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const { t } = useI18n()
const activeCategoryId = ref(settingsCategories[0]?.id ?? 'general')

const settings = computed(() => settingsStore.state)
const activeCategory = computed(() => getSettingsCategory(activeCategoryId.value))
const isReady = computed(() => settingsStore.ready)
const isSaving = computed(() => settingsStore.pending)

const readFieldValue = <K extends keyof SettingsState>(key: K) => {
  return settings.value?.[key]
}

const updateField = async <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
  await settingsStore.updateField(key, value)
}

const parseSelectValue = (field: SelectFieldDescriptor, rawValue: string) => {
  const matchingOption = field.options.find(option => String(option.value) === rawValue)
  return matchingOption ? matchingOption.value : rawValue
}

const handleToggleChange = async (field: SettingsFieldDescriptor, event: Event) => {
  const target = event.target as HTMLInputElement
  await updateField(field.key, target.checked as never)
}

const handleSelectChange = async (field: SelectFieldDescriptor, event: Event) => {
  const target = event.target as HTMLSelectElement
  await updateField(field.key, parseSelectValue(field, target.value) as never)
}

const handleRangeChange = async (field: RangeFieldDescriptor, event: Event) => {
  const target = event.target as HTMLInputElement
  await updateField(field.key, Number(target.value) as never)
}

const handleTextChange = async (field: SettingsFieldDescriptor, event: Event) => {
  const target = event.target as HTMLInputElement
  await updateField(field.key, target.value as never)
}

const handleBrowsePath = async (field: PathFieldDescriptor) => {
  await settingsStore.browsePath(field.key, field.pickerKind)
}

const clearPath = async (field: PathFieldDescriptor) => {
  await updateField(field.key, '' as never)
}
</script>

<template>
  <section class="settings-panel">
    <header class="settings-header">
      <div>
        <h2>{{ t('Settings') }}</h2>
        <p class="settings-subtitle">{{ t('Legacy preferences migrated into the modern shell.') }}</p>
      </div>
      <button type="button" class="settings-close" @click="emit('close')">{{ t('Close') }}</button>
    </header>

    <div class="settings-body">
      <nav class="settings-nav">
        <button
          v-for="category in settingsCategories"
          :key="category.id"
          type="button"
          class="nav-item"
          :class="{ active: activeCategoryId === category.id }"
          @click="activeCategoryId = category.id"
        >
          {{ t(category.label) }}
        </button>
      </nav>

      <div class="settings-content">
        <div v-if="!isReady || !settings" class="settings-placeholder">{{ t('Loading settings…') }}</div>
        <div v-else class="settings-sections">
          <section
            v-for="section in activeCategory.sections"
            :key="section.title"
            class="settings-section"
          >
            <h3>{{ t(section.title) }}</h3>

            <div
              v-for="field in section.fields"
              :key="field.key"
              class="settings-field"
              :class="{ disabled: field.disabled }"
            >
              <div class="field-meta">
                <label :for="field.key">{{ t(field.label) }}</label>
                <p v-if="field.description" class="field-description">{{ t(field.description) }}</p>
                <p v-if="field.restartRequired" class="field-note">{{ t('Requires restart to fully apply.') }}</p>
              </div>

              <div class="field-control">
                <template v-if="field.kind === 'toggle'">
                  <label class="toggle">
                    <input
                      :id="field.key"
                      :checked="Boolean(readFieldValue(field.key))"
                      :disabled="field.disabled || isSaving"
                      type="checkbox"
                      @change="handleToggleChange(field, $event)"
                    />
                    <span>{{ readFieldValue(field.key) ? t('On') : t('Off') }}</span>
                  </label>
                </template>

                <template v-else-if="field.kind === 'select'">
                  <select
                    :id="field.key"
                    :value="String(readFieldValue(field.key) ?? '')"
                    :disabled="field.disabled || isSaving"
                    @change="handleSelectChange(field, $event)"
                  >
                    <option
                      v-for="option in field.options"
                      :key="`${field.key}:${option.value}`"
                      :value="String(option.value)"
                    >
                      {{ t(option.label) }}
                    </option>
                  </select>
                </template>

                <template v-else-if="field.kind === 'range'">
                  <div class="range-control">
                    <input
                      :id="field.key"
                      :min="field.min"
                      :max="field.max"
                      :step="field.step"
                      :value="Number(readFieldValue(field.key) ?? field.min)"
                      :disabled="field.disabled || isSaving"
                      type="range"
                      @input="handleRangeChange(field, $event)"
                    />
                    <span class="range-value">
                      {{ readFieldValue(field.key) }}{{ field.unit ? ` ${field.unit}` : '' }}
                    </span>
                  </div>
                </template>

                <template v-else-if="field.kind === 'path'">
                  <div class="path-control">
                    <input
                      :id="field.key"
                      :value="String(readFieldValue(field.key) ?? '')"
                      :placeholder="field.placeholder ? t(field.placeholder) : undefined"
                      :disabled="field.disabled || isSaving"
                      type="text"
                      @change="handleTextChange(field, $event)"
                    />
                    <div class="path-actions">
                      <button
                        type="button"
                        :disabled="field.disabled || isSaving"
                        @click="handleBrowsePath(field)"
                      >
                        {{ t('Browse…') }}
                      </button>
                      <button
                        type="button"
                        :disabled="field.disabled || isSaving || !readFieldValue(field.key)"
                        @click="clearPath(field)"
                      >
                        {{ t('Clear') }}
                      </button>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <input
                    :id="field.key"
                    :value="String(readFieldValue(field.key) ?? '')"
                    :placeholder="field.kind === 'text' && field.placeholder ? t(field.placeholder) : undefined"
                    :disabled="field.disabled || isSaving"
                    type="text"
                    @change="handleTextChange(field, $event)"
                  />
                </template>
              </div>
            </div>
          </section>

          <section class="settings-section muted">
            <h3>{{ t('Not Yet Included') }}</h3>
            <p>{{ t('Key bindings and custom spell-check dictionary editing are still outside this panel.') }}</p>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-panel {
  width: min(920px, 96vw);
  height: min(88vh, 860px);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 22px;
  box-shadow: 0 26px 70px rgba(15, 23, 42, 0.2);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.settings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(250, 250, 250, 0.82));
}

.settings-header h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: var(--editorColor80);
}

.settings-subtitle {
  margin: 0;
  color: var(--editorColor50);
  font-size: 13px;
}

.settings-close {
  flex-shrink: 0;
}

.settings-body {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 14px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(180deg, rgba(245, 246, 247, 0.92), rgba(240, 241, 242, 0.82));
}

.nav-item {
  justify-content: flex-start;
  text-align: left;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--editorColor60);
  font-weight: 500;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(33, 181, 111, 0.14);
  color: var(--editorColor80);
  box-shadow: var(--surfaceInsetShadow);
}

.settings-content {
  min-height: 0;
  overflow: auto;
  padding: 20px 24px 28px;
}

.settings-placeholder {
  color: var(--editorColor50);
}

.settings-sections {
  display: grid;
  gap: 18px;
}

.settings-section {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 18px;
  padding: 16px 18px 8px;
  background: rgba(255, 255, 255, 0.66);
  box-shadow: var(--surfaceInsetShadow);
}

.settings-section h3 {
  margin: 0 0 12px;
  font-size: 15px;
  color: var(--editorColor80);
}

.settings-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
  gap: 14px;
  padding: 14px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.settings-field:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.settings-field.disabled {
  opacity: 0.6;
}

.field-meta label {
  display: block;
  font-weight: 600;
  color: var(--editorColor80);
  margin-bottom: 4px;
}

.field-description,
.field-note,
.settings-section.muted p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--editorColor50);
}

.field-note {
  margin-top: 4px;
}

.field-control {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.field-control input[type='text'],
.field-control select {
  width: 100%;
  min-height: 40px;
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid var(--surfaceBorderColor);
  background: rgba(255, 255, 255, 0.8);
  color: var(--editorColor80);
  box-shadow: var(--surfaceInsetShadow);
}

.field-control input[type='text']:focus,
.field-control select:focus {
  border-color: var(--themeColor30);
  box-shadow: 0 0 0 3px rgba(33, 181, 111, 0.1);
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--editorColor70);
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.range-control {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.range-value {
  min-width: 58px;
  text-align: right;
  color: var(--editorColor60);
  font-size: 12px;
}

.path-control {
  width: 100%;
  display: grid;
  gap: 8px;
}

.path-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.settings-section.muted {
  background: rgba(248, 249, 250, 0.78);
}

@media (max-width: 900px) {
  .settings-panel {
    width: min(96vw, 720px);
    height: min(92vh, 920px);
  }

  .settings-body {
    grid-template-columns: 1fr;
  }

  .settings-nav {
    border-right: 0;
    border-bottom: 1px solid var(--editorColor10);
    overflow-x: auto;
    flex-direction: row;
  }

  .settings-field {
    grid-template-columns: 1fr;
  }

  .field-control {
    justify-content: stretch;
  }
}
</style>
