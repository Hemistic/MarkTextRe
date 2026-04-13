<script setup lang="ts">
import { computed } from 'vue'
import filesIcon from '@legacy-assets/icons/files.svg'
import searchIcon from '@legacy-assets/icons/search.svg'
import tocIcon from '@legacy-assets/icons/toc.svg'
import settingIcon from '@legacy-assets/icons/setting.svg'
import type { RecentDocument } from '@shared/contracts'
import type { TocItem, SidebarTabItem } from '../features/editor/types'
import { LEGACY_SIDEBAR_ICONS } from './legacySidebarSupport'
import { useLegacySidebar, type LegacySidebarMode } from './useLegacySidebar'

const props = defineProps<{
  mode: LegacySidebarMode
  tabs: SidebarTabItem[]
  activeTabId: string | null
  recentDocuments: RecentDocument[]
  tocItems: TocItem[]
  searchQuery: string
  searchTotal: number
  searchActiveIndex: number
}>()

const emit = defineEmits<{
  'update:mode': [value: LegacySidebarMode]
  'select-tab': [id: string]
  'open-recent': [pathname: string]
  'open-file': []
  'new-file': []
  'select-heading': [slug: string]
  'update:search-query': [value: string]
  'search-next': []
  'search-prev': []
}>()

const icons = LEGACY_SIDEBAR_ICONS.map(item => ({
  ...item,
  icon: item.name === 'files'
    ? filesIcon
    : item.name === 'search'
      ? searchIcon
      : tocIcon
}))

const {
  localSearchQuery,
  searchInput,
  searchStatus,
  sidebarWidth,
  tocEntries,
  showFilesPanel,
  showSearchPanel,
  showTocPanel,
  toggleMode,
  focusSearchInput,
  handleSearchInput,
  handleSearchKeydown
} = useLegacySidebar(
  computed(() => props.mode),
  computed(() => props.tocItems),
  {
    searchQuery: computed(() => props.searchQuery),
    searchTotal: computed(() => props.searchTotal),
    searchActiveIndex: computed(() => props.searchActiveIndex)
  },
  {
    updateMode: value => emit('update:mode', value),
    updateSearchQuery: value => emit('update:search-query', value),
    searchNext: () => emit('search-next'),
    searchPrev: () => emit('search-prev')
  }
)

defineExpose({
  focusSearchInput
})
</script>

<template>
  <div class="side-bar" :style="{ width: sidebarWidth }">
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
      <section v-if="showFilesPanel" class="panel">
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

      <section v-else-if="showSearchPanel" class="panel">
        <p class="panel-title">SEARCH</p>
        <input
          ref="searchInput"
          v-model="localSearchQuery"
          class="search-input"
          type="text"
          placeholder="Search in document"
          @input="handleSearchInput"
          @keydown="handleSearchKeydown"
        />
        <div class="search-actions">
          <button class="action-button" type="button" @click="emit('search-prev')">Prev</button>
          <button class="action-button" type="button" @click="emit('search-next')">Next</button>
        </div>
        <p class="hint">{{ searchStatus }}</p>
      </section>

      <section v-else-if="showTocPanel" class="panel">
        <p class="panel-title">TABLE OF CONTENTS</p>
        <ul class="list toc-list">
          <li
            v-for="heading in tocEntries"
            :key="heading.key"
            :style="{ paddingLeft: heading.indent }"
            @click="heading.slug && emit('select-heading', heading.slug)"
          >
            <span class="text-overflow">{{ heading.content }}</span>
          </li>
          <li v-if="tocEntries.length === 0" class="empty">No headers</li>
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

.search-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
</style>
