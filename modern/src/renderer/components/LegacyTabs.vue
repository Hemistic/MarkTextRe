<script setup lang="ts">
interface TabItem {
  id: string
  filename: string
  pathname: string | null
  dirty: boolean
}

defineProps<{
  tabs: TabItem[]
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
  box-shadow: 0 0 9px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: var(--floatBgColor);
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
  padding: 0 8px;
  color: var(--editorColor50);
  font-size: 12px;
  line-height: 35px;
  height: 35px;
  max-width: 280px;
  background: var(--floatBgColor);
  display: flex;
  align-items: center;
}

.tabs-container > li > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 3px;
}

.tabs-container > li.active {
  background: var(--itemBgColor);
  z-index: 2;
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
  width: 18px;
  height: 18px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--editorColor50);
}

.close-icon:hover {
  background: var(--sideBarItemHoverBgColor);
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
}
</style>
