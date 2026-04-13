<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectTreeNode } from '@shared/contracts'

const props = defineProps<{
  activePathname: string | null
  depth: number
  node: ProjectTreeNode
  openPathnames: string[]
}>()

const emit = defineEmits<{
  'open-path': [pathname: string]
}>()

const isFolder = computed(() => props.node.isDirectory)
const isCollapsed = computed(() => props.node.isCollapsed ?? false)
const isOpen = computed(() => props.openPathnames.includes(props.node.pathname))
const isActive = computed(() => props.activePathname === props.node.pathname)
const indentation = computed(() => `${props.depth * 18 + 12}px`)

const toggleFolder = () => {
  if (!props.node.isDirectory) {
    return
  }

  props.node.isCollapsed = !(props.node.isCollapsed ?? false)
}

const openFile = () => {
  if (!props.node.isFile || !props.node.isMarkdown) {
    return
  }

  emit('open-path', props.node.pathname)
}
</script>

<template>
  <div class="tree-node">
    <div
      class="tree-row"
      :class="{
        active: isActive,
        open: isOpen,
        markdown: node.isMarkdown,
        muted: node.isFile && !node.isMarkdown
      }"
      :style="{ paddingLeft: indentation }"
      @click="isFolder ? toggleFolder() : openFile()"
    >
      <span class="marker">
        <template v-if="isFolder">{{ isCollapsed ? '▸' : '▾' }}</template>
        <template v-else>{{ node.isMarkdown ? '•' : '·' }}</template>
      </span>
      <span class="label">{{ node.name }}</span>
    </div>

    <div v-if="isFolder && !isCollapsed" class="children">
      <ProjectTreeNode
        v-for="folder in node.folders ?? []"
        :key="folder.pathname"
        :active-pathname="activePathname"
        :depth="depth + 1"
        :node="folder"
        :open-pathnames="openPathnames"
        @open-path="emit('open-path', $event)"
      />
      <ProjectTreeNode
        v-for="file in node.files ?? []"
        :key="file.pathname"
        :active-pathname="activePathname"
        :depth="depth + 1"
        :node="file"
        :open-pathnames="openPathnames"
        @open-path="emit('open-path', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--sideBarColor);
  transition: background-color 140ms ease, color 140ms ease;
}

.tree-row:hover {
  background: rgba(255, 255, 255, 0.48);
}

.tree-row.active {
  color: var(--sideBarTitleColor);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: inset 0 0 0 1px rgba(33, 181, 111, 0.12);
}

.tree-row.open:not(.active) {
  color: var(--highlightThemeColor);
}

.tree-row.muted {
  opacity: 0.6;
}

.marker {
  width: 12px;
  text-align: center;
  flex-shrink: 0;
  color: var(--sideBarTextColor);
  font-size: 12px;
}

.label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
