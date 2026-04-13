<script setup lang="ts">
import type { SidebarTabItem } from '../features/editor/types'

defineProps<{
  tabs: SidebarTabItem[]
  activeTabId: string
}>()

const emit = defineEmits<{
  select: [id: string]
  close: [id: string]
  create: []
}>()
</script>

<template>
  <div class="editor-tabs">
    <div class="scrollable-tabs">
      <ul class="tabs-container">
        <li
          v-for="tab in tabs"
          :key="tab.id"
          :title="tab.pathname ?? tab.filename"
          :class="{ active: activeTabId === tab.id, unsaved: tab.dirty }"
          @click="emit('select', tab.id)"
        >
          <span>{{ tab.filename }}</span>
          <button class="close-icon" type="button" @click.stop="emit('close', tab.id)">
            <span v-if="tab.dirty" class="unsaved-dot" />
            <span v-else>×</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="new-file">
      <button type="button" @click="emit('create')">+</button>
    </div>
  </div>
</template>

<style scoped>
.editor-tabs {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 35px;
  user-select: none;
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
}

.scrollable-tabs {
  flex: 1 1 auto;
  height: 35px;
  overflow: hidden;
}

.tabs-container {
  min-width: min-content;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 35px;
  display: flex;
  flex-direction: row;
}

.tabs-container > li {
  position: relative;
  padding: 0 10px 0 12px;
  color: var(--editorColor50);
  font-size: 12px;
  line-height: 35px;
  height: 35px;
  max-width: 280px;
  background: transparent;
  display: flex;
  align-items: center;
  border-right: 1px solid rgba(0, 0, 0, 0.04);
  transition: background-color 140ms ease, color 140ms ease;
}

.tabs-container > li:hover {
  background: rgba(255, 255, 255, 0.7);
}

.tabs-container > li > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 3px;
}

.tabs-container > li.active {
  background: rgba(255, 255, 255, 0.96);
  z-index: 2;
  color: var(--editorColor80);
}

.tabs-container > li.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--themeColor);
}

.close-icon {
  opacity: 0.8;
  border: none;
  background: transparent;
  width: 20px;
  height: 20px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--editorColor50);
  border-radius: 999px;
}

.close-icon:hover {
  background: rgba(0, 0, 0, 0.06);
}

.unsaved-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--themeColor);
}

.new-file {
  flex: 0 0 35px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-file button {
  border: none;
  background: transparent;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--editorColor50);
  border-radius: 999px;
}

.new-file button:hover {
  background: rgba(0, 0, 0, 0.06);
}
</style>
