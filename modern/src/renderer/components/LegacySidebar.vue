<script setup lang="ts">
import { computed, ref } from 'vue'
import filesIcon from '@legacy-assets/icons/files.svg'
import searchIcon from '@legacy-assets/icons/search.svg'
import tocIcon from '@legacy-assets/icons/toc.svg'
import settingIcon from '@legacy-assets/icons/setting.svg'
import type { ProjectTreeNode, RecentDocument } from '@shared/contracts'
import { useI18n } from '../i18n'
import type { TocItem, SidebarTabItem } from '../features/editor/types'
import type { HomeSearchOptionKey } from '../views/useHomeSearch'
import { LEGACY_SIDEBAR_ICONS } from './legacySidebarSupport'
import ProjectTreeNodeItem from './ProjectTreeNode.vue'
import { useLegacySidebar, type LegacySidebarMode } from './useLegacySidebar'

const props = defineProps<{
  activePathname: string | null
  mode: LegacySidebarMode
  openPathnames: string[]
  projectTree: ProjectTreeNode | null
  tabs: SidebarTabItem[]
  activeTabId: string | null
  recentDocuments: RecentDocument[]
  tocItems: TocItem[]
  searchQuery: string
  replaceQuery: string
  searchError: string
  searchOptions: {
    isCaseSensitive: boolean
    isWholeWord: boolean
    isRegexp: boolean
  }
  searchTotal: number
  searchActiveIndex: number
}>()

const emit = defineEmits<{
  'update:mode': [value: LegacySidebarMode]
  'select-tab': [id: string]
  'close-tab': [id: string]
  'open-recent': [pathname: string]
  'open-file': []
  'open-folder': []
  'open-path': [pathname: string]
  'new-file': []
  'open-settings': []
  'select-heading': [slug: string]
  'update:search-query': [value: string]
  'update:replace-query': [value: string]
  'toggle-search-option': [key: HomeSearchOptionKey]
  'search-next': []
  'search-prev': []
  'replace-current': []
  'replace-all': []
}>()

const icons = LEGACY_SIDEBAR_ICONS.map(item => ({
  ...item,
  icon: item.name === 'files'
    ? filesIcon
    : item.name === 'search'
      ? searchIcon
      : tocIcon
}))
const { t } = useI18n()
const isReplaceExpanded = ref(false)

const {
  localSearchQuery,
  localReplaceQuery,
  searchError,
  searchOptions,
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
  handleReplaceInput,
  toggleSearchOption,
  handleSearchKeydown
} = useLegacySidebar(
  computed(() => props.mode),
  computed(() => props.tocItems),
  {
    searchQuery: computed(() => props.searchQuery),
    replaceQuery: computed(() => props.replaceQuery),
    searchError: computed(() => props.searchError),
    searchOptions: computed(() => props.searchOptions),
    searchTotal: computed(() => props.searchTotal),
    searchActiveIndex: computed(() => props.searchActiveIndex)
  },
  {
    updateMode: value => emit('update:mode', value),
    updateSearchQuery: value => emit('update:search-query', value),
    updateReplaceQuery: value => emit('update:replace-query', value),
    toggleSearchOption: key => emit('toggle-search-option', key),
    searchNext: () => emit('search-next'),
    searchPrev: () => emit('search-prev'),
    replaceCurrent: () => emit('replace-current'),
    replaceAll: () => emit('replace-all')
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
        <li @click="emit('open-settings')">
          <img :src="settingIcon" :alt="t('Settings')" />
        </li>
      </ul>
    </div>

    <div v-if="mode" class="right-column">
      <section v-if="showFilesPanel" class="panel">
        <p class="panel-title">{{ t('OPEN TABS') }}</p>
        <ul class="list">
          <li
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTabId === tab.id }"
            @click="emit('select-tab', tab.id)"
          >
            <span class="text-overflow">{{ tab.filename }}</span>
            <button class="tab-close-button" type="button" @click.stop="emit('close-tab', tab.id)">
              ×
            </button>
          </li>
          <li v-if="tabs.length === 0" class="empty">{{ t('No open tabs') }}</li>
        </ul>

        <p class="panel-title secondary">{{ t('WORKSPACE') }}</p>
        <div v-if="projectTree" class="project-tree">
          <ProjectTreeNodeItem
            :active-pathname="activePathname"
            :depth="0"
            :node="projectTree"
            :open-pathnames="openPathnames"
            @open-path="emit('open-path', $event)"
          />
        </div>
        <p v-else class="empty">{{ t('No folder opened') }}</p>

        <p class="panel-title secondary">{{ t('RECENT') }}</p>
        <ul class="list muted-list">
          <li
            v-for="item in recentDocuments"
            :key="item.pathname"
            @click="emit('open-recent', item.pathname)"
          >
            <span class="text-overflow">{{ item.filename }}</span>
          </li>
          <li v-if="recentDocuments.length === 0" class="empty">{{ t('No recent files') }}</li>
        </ul>
      </section>

      <section v-else-if="showSearchPanel" class="panel">
        <p class="panel-title">{{ t('SEARCH') }}</p>
        <div class="search-shell" :class="{ error: Boolean(searchError) }">
          <input
            ref="searchInput"
            v-model="localSearchQuery"
            class="search-input"
            type="text"
            :placeholder="t('Search in document')"
            @input="handleSearchInput"
            @keydown="handleSearchKeydown"
          />

          <div class="search-meta-row">
            <span class="search-result">{{ searchStatus }}</span>

            <div class="search-toggle-group">
              <button
                class="search-toggle"
                :class="{ active: searchOptions.isCaseSensitive }"
                type="button"
                :title="t('Case Sensitive')"
                @click="toggleSearchOption('isCaseSensitive')"
              >
                Aa
              </button>
              <button
                class="search-toggle"
                :class="{ active: searchOptions.isWholeWord }"
                type="button"
                :title="t('Whole Word')"
                @click="toggleSearchOption('isWholeWord')"
              >
                W
              </button>
              <button
                class="search-toggle regex"
                :class="{ active: searchOptions.isRegexp }"
                type="button"
                :title="t('Regular Expression')"
                @click="toggleSearchOption('isRegexp')"
              >
                .*
              </button>
            </div>

          </div>

          <div class="search-actions-row">
            <div class="search-actions">
              <button class="nav-button" type="button" :title="t('Prev')" @click="emit('search-prev')">
                ^
              </button>
              <button class="nav-button" type="button" :title="t('Next')" @click="emit('search-next')">
                v
              </button>
              <button
                class="nav-button replace-toggle-button"
                type="button"
                :title="t('Replace')"
                @click="isReplaceExpanded = !isReplaceExpanded"
              >
                {{ isReplaceExpanded ? '▴' : '▾' }}
              </button>
            </div>
          </div>

          <div v-if="isReplaceExpanded" class="replace-panel">
            <div class="replace-row">
              <input
                v-model="localReplaceQuery"
                class="search-input replace-input"
                type="text"
                :placeholder="t('Replacement')"
                @input="handleReplaceInput"
              />
            </div>
            <div class="replace-actions">
              <button class="replace-button secondary" type="button" @click="emit('replace-current')">
                {{ t('Replace') }}
              </button>
              <button class="replace-button" type="button" @click="emit('replace-all')">
                {{ t('Replace All') }}
              </button>
            </div>
          </div>
        </div>
        <p v-if="searchError" class="search-error">{{ t(searchError) }}</p>
      </section>

      <section v-else-if="showTocPanel" class="panel">
        <p class="panel-title">{{ t('TABLE OF CONTENTS') }}</p>
        <ul class="list toc-list">
          <li
            v-for="heading in tocEntries"
            :key="heading.key"
            :style="{ paddingLeft: heading.indent }"
            @click="heading.slug && emit('select-heading', heading.slug)"
          >
            <span class="text-overflow">{{ heading.content }}</span>
          </li>
          <li v-if="tocEntries.length === 0" class="empty">{{ t('No headers') }}</li>
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
  border-right: 1px solid var(--surfaceBorderColor);
  box-shadow: var(--surfaceShadowSoft);
  backdrop-filter: blur(16px);
}

.left-column {
  height: 100%;
  width: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 20px;
  box-sizing: border-box;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.08));
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
  height: 42px;
  margin: 2px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 12px 0 0 12px;
  transition: background-color 140ms ease, transform 140ms ease;
}

.left-column li:hover {
  background: rgba(255, 255, 255, 0.3);
}

.left-column img {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  transition: opacity 140ms ease, transform 140ms ease, filter 140ms ease;
}

.left-column li.active img {
  opacity: 1;
  transform: scale(1.02);
  filter: saturate(1.25);
}

.left-column li.active {
  background: rgba(255, 255, 255, 0.66);
}

.right-column {
  flex: 1;
  overflow: hidden;
  border-left: 1px solid rgba(255, 255, 255, 0.42);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(248, 249, 250, 0.78));
}

.panel {
  height: 100%;
  overflow-y: auto;
  padding: 18px 14px 22px;
  box-sizing: border-box;
}

.panel-title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--sideBarTextColor);
}

.panel-title.secondary {
  margin-top: 24px;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-tree {
  margin-bottom: 8px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.list li {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  line-height: 1.4;
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--sideBarColor);
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease;
}

.list li:hover {
  background: rgba(255, 255, 255, 0.52);
}

.list li.active {
  background: rgba(255, 255, 255, 0.72);
  color: var(--sideBarTitleColor);
  box-shadow: inset 0 0 0 1px rgba(33, 181, 111, 0.12);
}

.list li .text-overflow {
  flex: 1;
}

.tab-close-button {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--editorColor40);
  font-size: 14px;
  line-height: 1;
  box-shadow: none;
}

.tab-close-button:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--editorColor70);
}

.empty,
.hint {
  color: var(--sideBarTextColor);
  font-size: 12px;
}

.search-shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid var(--surfaceBorderColor);
  border-radius: 14px;
  box-shadow: var(--surfaceInsetShadow);
}

.search-shell.error {
  border-color: rgba(195, 83, 66, 0.55);
}

.search-input {
  width: 100%;
  margin: 0;
  min-height: 36px;
  padding: 8px 12px;
  background: rgba(248, 249, 250, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  color: var(--editorColor80);
  box-shadow: none;
  font-size: 13px;
}

.search-input:focus {
  outline: none;
  border-color: rgba(33, 181, 111, 0.32);
  box-shadow: 0 0 0 3px rgba(33, 181, 111, 0.08);
}

.search-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-result {
  min-width: 42px;
  padding: 0 8px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--sideBarTitleColor);
  background: rgba(33, 181, 111, 0.1);
  border-radius: 999px;
}

.search-toggle-group {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-toggle {
  min-width: 30px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: rgba(248, 249, 250, 0.9);
  color: var(--editorColor40);
  font-size: 12px;
  font-weight: 600;
  box-shadow: none;
}

.search-toggle.regex {
  font-weight: 700;
  letter-spacing: -0.04em;
}

.search-toggle:hover {
  background: rgba(255, 255, 255, 0.98);
  color: var(--editorColor70);
}

.search-toggle.active {
  border-color: rgba(33, 181, 111, 0.22);
  background: rgba(33, 181, 111, 0.12);
  color: var(--highlightThemeColor);
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.search-actions-row {
  display: flex;
  width: 100%;
}

.replace-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.replace-input {
  flex: 1;
}

.replace-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 2px;
}

.replace-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.replace-button {
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(33, 181, 111, 0.18);
  border-radius: 8px;
  background: rgba(33, 181, 111, 0.12);
  color: var(--highlightThemeColor);
  font-size: 12px;
  font-weight: 600;
  box-shadow: none;
}

.replace-button.secondary {
  border-color: rgba(15, 23, 42, 0.08);
  background: rgba(248, 249, 250, 0.92);
  color: var(--editorColor70);
}

.replace-button:hover {
  background: rgba(33, 181, 111, 0.18);
}

.replace-button.secondary:hover {
  background: rgba(255, 255, 255, 0.98);
}

.nav-button {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: rgba(248, 249, 250, 0.9);
  color: var(--editorColor60);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  box-shadow: none;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.98);
  color: var(--sideBarTitleColor);
}

.replace-toggle-button {
  font-size: 11px;
  flex: 0 0 44px;
}

.search-error {
  margin: 8px 0 0;
  color: #b44c39;
  font-size: 12px;
}
</style>
