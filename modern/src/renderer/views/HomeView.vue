<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import LegacyRecent from '../components/LegacyRecent.vue'
import LegacySidebar from '../components/LegacySidebar.vue'
import LegacyTabs from '../components/LegacyTabs.vue'
import LegacyTitleBar from '../components/LegacyTitleBar.vue'
import { useHomeViewService } from './useHomeViewService'

const AsyncMuyaEditor = defineAsyncComponent(() => import('../components/MuyaEditor.vue'))

const { bindings, isSettingsOpen, closeSettings } = useHomeViewService()
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
      @open-settings="sidebarHandlers.openSettings"
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

    <div v-if="isSettingsOpen" class="settings-overlay" @click.self="closeSettings">
      <section class="settings-panel">
        <header class="settings-header">
          <h2>Settings</h2>
          <button type="button" class="settings-close" @click="closeSettings">Close</button>
        </header>
        <p class="settings-copy">Settings UI is not fully migrated yet.</p>
        <p class="settings-copy">The button is now wired, and this panel is the placeholder entry for the upcoming modern settings surface.</p>
      </section>
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

.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.28);
}

.settings-panel {
  width: min(360px, 92vw);
  height: 100%;
  padding: 20px 18px;
  box-sizing: border-box;
  background: var(--editorBgColor);
  border-left: 1px solid var(--editorColor10);
  box-shadow: -12px 0 32px rgba(15, 23, 42, 0.16);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.settings-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--editorColor80);
}

.settings-close {
  border: 1px solid var(--editorColor10);
  border-radius: 6px;
  padding: 6px 10px;
  background: var(--itemBgColor);
  color: var(--editorColor80);
}

.settings-copy {
  margin: 0 0 10px;
  line-height: 1.6;
  color: var(--editorColor60);
}
</style>
