<script setup lang="ts">
import filesIcon from '@legacy-assets/icons/files.svg'
import searchIcon from '@legacy-assets/icons/search.svg'
import tocIcon from '@legacy-assets/icons/toc.svg'
import settingIcon from '@legacy-assets/icons/setting.svg'

interface RecentDocument {
  pathname: string
  filename: string
}

interface HeadingItem {
  depth: number
  text: string
}

interface TabItem {
  id: string
  filename: string
  pathname: string | null
  dirty: boolean
}

const props = defineProps<{
  mode: 'files' | 'search' | 'toc' | ''
  tabs: TabItem[]
  activeTabId: string | null
  recentDocuments: RecentDocument[]
  headings: HeadingItem[]
}>()

const emit = defineEmits<{
  'update:mode': [value: 'files' | 'search' | 'toc' | '']
  'select-tab': [id: string]
  'open-recent': [pathname: string]
  'open-file': []
  'new-file': []
}>()

const icons = [
  { name: 'files', icon: filesIcon, label: 'Files' },
  { name: 'search', icon: searchIcon, label: 'Search' },
  { name: 'toc', icon: tocIcon, label: 'Outline' }
] as const

const toggleMode = (mode: 'files' | 'search' | 'toc') => {
  emit('update:mode', props.mode === mode ? '' : mode)
}
</script>

<template>
  <div class="side-bar" :style="{ width: mode ? '280px' : '45px' }">
    <div class="left-column">
      <ul>
        <li
          v-for="item in icons"
          :key="item.name"
          :class="{ active: mode === item.name }"
          @click="toggleMode(item.name)"
        >
          <img :src="item.icon" :alt="item.label" />
        </li>
      </ul>
      <ul class="bottom">
        <li>
          <img :src="settingIcon" alt="Settings" />
        </li>
      </ul>
    </div>

    <div v-if="mode" class="right-column">
      <section v-if="mode === 'files'" class="panel">
        <div class="file-actions">
          <button class="action-button" type="button" @click="emit('new-file')">New</button>
          <button class="action-button" type="button" @click="emit('open-file')">Open</button>
        </div>

        <p class="panel-title">OPEN TABS</p>
        <ul class="list">
          <li
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTabId === tab.id }"
            @click="emit('select-tab', tab.id)"
          >
            <span class="text-overflow">{{ tab.filename }}</span>
            <span v-if="tab.dirty" class="dirty-dot" />
          </li>
          <li v-if="tabs.length === 0" class="empty">No open tabs</li>
        </ul>

        <p class="panel-title secondary">RECENT</p>
        <ul class="list muted-list">
          <li
            v-for="item in recentDocuments"
            :key="item.pathname"
            @click="emit('open-recent', item.pathname)"
          >
            <span class="text-overflow">{{ item.filename }}</span>
          </li>
          <li v-if="recentDocuments.length === 0" class="empty">No recent files</li>
        </ul>
      </section>

      <section v-else-if="mode === 'search'" class="panel">
        <p class="panel-title">SEARCH</p>
        <input class="search-input" type="text" placeholder="Search migration target" />
        <p class="hint">Full project search has not been migrated yet.</p>
      </section>

      <section v-else class="panel">
        <p class="panel-title">TABLE OF CONTENTS</p>
        <ul class="list toc-list">
          <li
            v-for="heading in headings"
            :key="`${heading.depth}:${heading.text}`"
            :style="{ paddingLeft: `${(heading.depth - 1) * 12}px` }"
          >
            <span class="text-overflow">{{ heading.text }}</span>
          </li>
          <li v-if="headings.length === 0" class="empty">No headers</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.side-bar {
  display: flex;
  flex-shrink: 0;
  height: 100vh;
  min-width: 45px;
  position: relative;
  color: var(--sideBarColor);
  user-select: none;
  background: var(--sideBarBgColor);
  border-right: 1px solid var(--itemBgColor);
}

.left-column {
  height: 100%;
  width: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 40px;
  box-sizing: border-box;
}

.left-column ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.left-column li {
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.left-column img {
  width: 18px;
  height: 18px;
  opacity: 0.75;
}

.left-column li.active img {
  opacity: 1;
  filter: saturate(1.2);
}

.right-column {
  flex: 1;
  overflow: hidden;
  border-left: 1px solid rgba(255, 255, 255, 0.35);
}

.panel {
  height: 100%;
  padding: 16px 14px;
  box-sizing: border-box;
}

.file-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.action-button {
  flex: 1;
  border: 1px solid var(--editorColor10);
  border-radius: 6px;
  background: var(--itemBgColor);
  color: var(--editorColor80);
  padding: 7px 10px;
}

.panel-title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--sideBarTextColor);
}

.panel-title.secondary {
  margin-top: 22px;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list li {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  line-height: 30px;
  padding: 0 8px;
  border-radius: 4px;
  color: var(--sideBarColor);
  cursor: pointer;
}

.list li:hover {
  background: var(--sideBarItemHoverBgColor);
}

.list li.active {
  background: var(--itemBgColor);
  color: var(--sideBarTitleColor);
}

.list li .text-overflow {
  flex: 1;
}

.dirty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--themeColor);
}

.empty,
.hint {
  color: var(--sideBarTextColor);
  font-size: 12px;
}

.search-input {
  width: 100%;
  margin-bottom: 10px;
  background: var(--inputBgColor);
  border: 1px solid var(--editorColor10);
  color: var(--editorColor80);
  border-radius: 6px;
  padding: 8px 10px;
}
</style>
