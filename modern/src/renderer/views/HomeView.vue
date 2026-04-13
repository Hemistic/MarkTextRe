<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import LegacyRecent from '../components/LegacyRecent.vue'
import LegacySidebar from '../components/LegacySidebar.vue'
import LegacyTabs from '../components/LegacyTabs.vue'
import LegacyTitleBar from '../components/LegacyTitleBar.vue'
import { useHomeViewModel } from './useHomeViewModel'

const AsyncMuyaEditor = defineAsyncComponent(() => import('../components/MuyaEditor.vue'))

const { bindings } = useHomeViewModel()
const {
  editorHandlers,
  editorProps,
  flags,
  recentHandlers,
  recentProps,
  refs,
  sidebarHandlers,
  sidebarProps,
  tabsHandlers,
  tabsProps,
  titleBarHandlers,
  titleBarProps
} = bindings
</script>

<template>
  <div class="editor-container">
    <LegacySidebar
      :ref="refs.sideBar"
      :mode="sidebarProps.mode"
      :tabs="sidebarProps.tabs"
      :active-tab-id="sidebarProps.activeTabId"
      :recent-documents="sidebarProps.recentDocuments"
      :toc-items="sidebarProps.tocItems"
      :search-query="sidebarProps.searchQuery"
      :search-total="sidebarProps.searchTotal"
      :search-active-index="sidebarProps.searchActiveIndex"
      @update:mode="sidebarHandlers.updateMode"
      @select-tab="sidebarHandlers.selectTab"
      @open-recent="sidebarHandlers.openRecent"
      @open-file="sidebarHandlers.openFile"
      @new-file="sidebarHandlers.newFile"
      @select-heading="sidebarHandlers.selectHeading"
      @update:search-query="sidebarHandlers.updateSearchQuery"
      @search-next="sidebarHandlers.searchNext"
      @search-prev="sidebarHandlers.searchPrev"
    />

    <div class="editor-middle">
      <LegacyTitleBar
        :bootstrap="titleBarProps.bootstrap"
        :pathname="titleBarProps.pathname"
        :filename="titleBarProps.filename"
        :dirty="titleBarProps.dirty"
        :word-count="titleBarProps.wordCount"
        :has-document="titleBarProps.hasDocument"
        :show-tab-bar="titleBarProps.showTabBar"
        @new-file="titleBarHandlers.newFile"
        @open-file="titleBarHandlers.openFile"
        @save-file="titleBarHandlers.saveFile"
        @save-file-as="titleBarHandlers.saveFileAs"
        @toggle-devtools="titleBarHandlers.toggleDevTools"
        @minimize-window="titleBarHandlers.minimizeWindow"
        @maximize-window="titleBarHandlers.maximizeWindow"
        @close-window="titleBarHandlers.closeWindow"
      />

      <div class="editor-with-tabs">
        <LegacyTabs
          v-if="flags.hasTabs"
          :tabs="tabsProps.tabs"
          :active-tab-id="tabsProps.activeTabId"
          @select="tabsHandlers.select"
          @close="tabsHandlers.close"
          @create="tabsHandlers.create"
        />

        <LegacyRecent
          v-if="flags.showHome"
          :recent-documents="recentProps.recentDocuments"
          @create="recentHandlers.create"
          @open-file="recentHandlers.openFile"
          @open-recent="recentHandlers.openRecent"
          @open-sample="recentHandlers.openSample"
        />

        <div v-else-if="flags.hasActiveDocument" class="editor-content">
          <component
            :is="AsyncMuyaEditor"
            :ref="refs.muyaEditor"
            :key="editorProps.documentId"
            :document-id="editorProps.documentId"
            :model-value="editorProps.modelValue"
            :cursor="editorProps.cursor"
            :history="editorProps.history"
            @editor-change="editorHandlers.editorChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: row;
  position: absolute;
  width: 100vw;
  height: 100vh;
  inset: 0;
}

.editor-middle {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100vh;
  position: relative;
}

.editor-with-tabs {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--editorBgColor);
}

.editor-content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--editorBgColor);
}

.editor-content :deep(.muya-shell) {
  height: 100%;
  min-height: 0;
  width: 100%;
}
</style>
