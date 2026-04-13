<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { AppBootstrap } from '@shared/contracts'
import type { DocumentWordCount } from '../features/editor/types'
import { TITLE_BAR_LABEL_MAP, useLegacyTitleBar } from './useLegacyTitleBar'

const props = defineProps<{
  bootstrap: AppBootstrap | null
  pathname: string | null
  filename: string
  dirty: boolean
  wordCount: DocumentWordCount
  hasDocument?: boolean
  showTabBar?: boolean
}>()

const emit = defineEmits<{
  'new-file': []
  'open-file': []
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
</script>

<template>
  <div>
    <div class="title-bar-editor-bg" :class="{ 'tabs-visible': showTabBar }" />
    <div class="title-bar active" :class="{ 'tabs-visible': showTabBar }">
      <div class="title">
        <span v-if="!filename">MarkText</span>
        <span v-else>
          <span v-for="(segment, index) in pathSegments" :key="`${segment}:${index}`">
            {{ segment }}
            <span class="separator">›</span>
          </span>
          <span class="filename">{{ filename }}</span>
          <span class="save-dot" :class="{ show: dirty }" />
        </span>
      </div>

      <div class="right-toolbar title-no-drag">
        <button class="toolbar-button" type="button" @click="emit('new-file')">New</button>
        <button class="toolbar-button" type="button" @click="emit('open-file')">Open</button>
        <button class="toolbar-button" type="button" :disabled="!hasDocument" @click="emit('save-file')">Save</button>
        <button class="toolbar-button" type="button" :disabled="!hasDocument" @click="emit('save-file-as')">Save As</button>
        <button class="toolbar-button" type="button" @click="emit('toggle-devtools')">DevTools</button>
        <button v-if="hasDocument" class="word-count" type="button" @click="cycleMetric">
          {{ `${TITLE_BAR_LABEL_MAP[currentMetric].short} ${wordCount[currentMetric]}` }}
        </button>
      </div>

      <div v-if="platform !== 'darwin'" class="window-controls title-no-drag">
        <button class="window-button" type="button" @click="emit('minimize-window')">_</button>
        <button class="window-button" type="button" @click="emit('maximize-window')">□</button>
        <button class="window-button close" type="button" @click="emit('close-window')">×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-bar-editor-bg {
  height: var(--titleBarHeight);
  background: var(--editorBgColor);
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
  padding: 0 460px 0 142px;
  height: 100%;
  line-height: var(--titleBarHeight);
  font-size: 14px;
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
}

.separator {
  margin: 0 6px;
  color: var(--editorColor30);
}

.save-dot {
  margin-left: 3px;
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
  width: 420px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.toolbar-button {
  cursor: pointer;
  font-size: 12px;
  color: var(--editorColor50);
  line-height: 24px;
  padding: 2px 8px;
  border-radius: 3px;
  border: none;
  background: transparent;
}

.toolbar-button:hover:not(:disabled) {
  background: var(--sideBarBgColor);
  color: var(--sideBarTitleColor);
}

.toolbar-button:disabled {
  opacity: 0.4;
  cursor: default;
}

.word-count {
  cursor: pointer;
  font-size: 12px;
  color: var(--editorColor30);
  text-align: center;
  line-height: 24px;
  padding: 2px 8px;
  border-radius: 3px;
  border: none;
  background: transparent;
}

.word-count:hover {
  background: var(--sideBarBgColor);
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
  background: rgba(0, 0, 0, 0.08);
}

.window-button.close:hover {
  background: rgb(228, 79, 79);
  color: white;
}
</style>
