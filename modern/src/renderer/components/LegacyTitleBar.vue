<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRef } from 'vue'
import type { AppBootstrap } from '@shared/contracts'
import type { DocumentWordCount } from '../features/editor/types'
import { TITLE_BAR_LABEL_MAP, useLegacyTitleBar } from './useLegacyTitleBar'
import { useI18n, translateMetricShort } from '../i18n'

const props = defineProps<{
  bootstrap: AppBootstrap | null
  pathname: string | null
  filename: string
  dirty: boolean
  wordCount: DocumentWordCount
  hasDocument?: boolean
  showPathSegments?: boolean
  showTabBar?: boolean
}>()

const emit = defineEmits<{
  'new-file': []
  'open-file': []
  'open-folder': []
  'save-file': []
  'save-file-as': []
  'toggle-devtools': []
  'minimize-window': []
  'maximize-window': []
  'close-window': []
}>()

const { currentMetric, cycleMetric, pathSegments, platform } = useLegacyTitleBar(
  toRef(props, 'pathname'),
  computed(() => props.bootstrap?.platform)
)
const { locale, t } = useI18n()
const isOpenMenuVisible = ref(false)

const closeOpenMenu = () => {
  isOpenMenuVisible.value = false
}

const toggleOpenMenu = () => {
  isOpenMenuVisible.value = !isOpenMenuVisible.value
}

const handleOpenFile = () => {
  closeOpenMenu()
  emit('open-file')
}

const handleOpenFolder = () => {
  closeOpenMenu()
  emit('open-folder')
}

const handleWindowPointerDown = () => {
  closeOpenMenu()
}

onMounted(() => {
  window.addEventListener('pointerdown', handleWindowPointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handleWindowPointerDown)
})
</script>

<template>
  <div>
    <div class="title-bar-editor-bg" :class="{ 'tabs-visible': showTabBar }" />
    <div class="title-bar active" :class="{ 'tabs-visible': showTabBar }">
      <div class="title">
        <span v-if="!filename">MarkText</span>
        <span v-else>
          <span
            v-for="(segment, index) in showPathSegments ? pathSegments : []"
            :key="`${segment}:${index}`"
          >
            {{ segment }}
            <span class="separator">›</span>
          </span>
          <span class="filename">{{ filename }}</span>
          <span class="save-dot" :class="{ show: dirty }" />
        </span>
      </div>

      <div class="right-toolbar title-no-drag">
        <button class="toolbar-button" type="button" @click="emit('new-file')">{{ t('New') }}</button>
        <div class="toolbar-menu" @pointerdown.stop>
          <button class="toolbar-button open-button" type="button" @click="toggleOpenMenu">
            {{ t('Open') }}
            <span class="open-caret">▾</span>
          </button>
          <div v-if="isOpenMenuVisible" class="open-menu">
            <button class="open-menu-item" type="button" @click="handleOpenFile">{{ t('File') }}</button>
            <button class="open-menu-item" type="button" @click="handleOpenFolder">{{ t('Folder') }}</button>
          </div>
        </div>
        <button class="toolbar-button" type="button" :disabled="!hasDocument" @click="emit('save-file')">{{ t('Save') }}</button>
        <button class="toolbar-button" type="button" :disabled="!hasDocument" @click="emit('save-file-as')">{{ t('Save As') }}</button>
        <button class="toolbar-button" type="button" @click="emit('toggle-devtools')">{{ t('DevTools') }}</button>
        <button v-if="hasDocument" class="word-count" type="button" @click="cycleMetric">
          {{ `${translateMetricShort(locale, currentMetric) ?? TITLE_BAR_LABEL_MAP[currentMetric].short} ${wordCount[currentMetric]}` }}
        </button>
      </div>

      <div v-if="platform !== 'darwin'" class="window-controls title-no-drag">
        <button class="window-button" type="button" @click="emit('minimize-window')">
          <span class="window-glyph minimize" />
        </button>
        <button class="window-button" type="button" @click="emit('maximize-window')">
          <span class="window-glyph maximize" />
        </button>
        <button class="window-button close" type="button" @click="emit('close-window')">
          <span class="window-glyph close-glyph" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-bar-editor-bg {
  height: var(--titleBarHeight);
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(16px);
}

.title-bar {
  -webkit-app-region: drag;
  user-select: none;
  background: transparent;
  height: var(--titleBarHeight);
  box-sizing: border-box;
  color: var(--editorColor50);
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  z-index: 20;
  cursor: default;
}

.title-bar.active {
  color: var(--editorColor);
}

.title {
  padding: 0 470px 0 150px;
  height: 100%;
  line-height: var(--titleBarHeight);
  font-size: 13px;
  text-align: center;
}

.title > span {
  display: block;
  direction: rtl;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

.filename {
  color: var(--editorColor);
  font-weight: 600;
}

.separator {
  margin: 0 6px;
  color: var(--editorColor30);
}

.save-dot {
  margin-left: 13px;
  width: 7px;
  height: 7px;
  display: inline-block;
  border-radius: 50%;
  background: var(--highlightThemeColor);
  opacity: 0.7;
  visibility: hidden;
}

.save-dot.show {
  visibility: visible;
}

.right-toolbar {
  height: 100%;
  position: absolute;
  top: 0;
  right: 138px;
  width: 470px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.toolbar-menu {
  position: relative;
}

.toolbar-button {
  cursor: pointer;
  font-size: 12px;
  color: var(--editorColor60);
  line-height: 24px;
  padding: 3px 10px;
  border-radius: 999px;
  border: none;
  background: transparent;
}

.open-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.open-caret {
  font-size: 10px;
  color: var(--editorColor40);
}

.open-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 120px;
  padding: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(14px);
}

.open-menu-item {
  width: 100%;
  min-height: 30px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--editorColor70);
  text-align: left;
  box-shadow: none;
}

.open-menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.toolbar-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.8);
  color: var(--sideBarTitleColor);
}

.toolbar-button:disabled {
  opacity: 0.4;
  cursor: default;
}

.word-count {
  cursor: pointer;
  font-size: 12px;
  color: var(--editorColor40);
  text-align: center;
  line-height: 24px;
  padding: 3px 10px;
  border-radius: 999px;
  border: none;
  background: transparent;
}

.word-count:hover {
  background: rgba(255, 255, 255, 0.8);
  color: var(--sideBarTitleColor);
}

.title-no-drag {
  -webkit-app-region: no-drag;
}

.window-controls {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
}

.window-button {
  width: 46px;
  height: var(--titleBarHeight);
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--editorColor70);
  font-size: 12px;
}

.window-button:hover {
  background: rgba(0, 0, 0, 0.06);
}

.window-button.close:hover {
  background: rgb(228, 79, 79);
  color: white;
}

.window-glyph {
  position: relative;
  display: inline-block;
  width: 12px;
  height: 12px;
}

.window-glyph.minimize::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2px;
  height: 1.5px;
  background: currentColor;
}

.window-glyph.maximize::before {
  content: '';
  position: absolute;
  inset: 1px;
  border: 1.5px solid currentColor;
  border-radius: 1px;
}

.window-glyph.close-glyph::before,
.window-glyph.close-glyph::after {
  content: '';
  position: absolute;
  top: 5px;
  left: -1px;
  width: 14px;
  height: 1.5px;
  background: currentColor;
}

.window-glyph.close-glyph::before {
  transform: rotate(45deg);
}

.window-glyph.close-glyph::after {
  transform: rotate(-45deg);
}
</style>
