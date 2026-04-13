<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import LegacyRecent from '../components/LegacyRecent.vue'
import LegacySidebar from '../components/LegacySidebar.vue'
import LegacyTitleBar from '../components/LegacyTitleBar.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import { useHomeViewService } from './useHomeViewService'

const AsyncMuyaEditor = defineAsyncComponent(() => import('../components/MuyaEditor.vue'))

const { bindings, isSettingsOpen, closeSettings, settingsState } = useHomeViewService()
const {
  editorHandlers,
  editorProps,
  flags,
  recentHandlers,
  recentProps,
  refs,
  sidebarHandlers,
  sidebarProps,
  titleBarHandlers,
  titleBarProps
} = bindings
</script>

<template>
  <div class="editor-container">
    <LegacySidebar
      :ref="refs.sideBar"
      :active-pathname="sidebarProps.activePathname"
      :mode="sidebarProps.mode"
      :open-pathnames="sidebarProps.openPathnames"
      :project-tree="sidebarProps.projectTree"
      :tabs="sidebarProps.tabs"
      :active-tab-id="sidebarProps.activeTabId"
      :recent-documents="sidebarProps.recentDocuments"
      :toc-items="sidebarProps.tocItems"
      :search-query="sidebarProps.searchQuery"
      :search-error="sidebarProps.searchError"
      :search-options="sidebarProps.searchOptions"
      :search-total="sidebarProps.searchTotal"
      :search-active-index="sidebarProps.searchActiveIndex"
      :replace-query="sidebarProps.replaceQuery"
      @update:mode="sidebarHandlers.updateMode"
      @select-tab="sidebarHandlers.selectTab"
      @close-tab="sidebarHandlers.closeTab"
      @open-recent="sidebarHandlers.openRecent"
      @open-file="sidebarHandlers.openFile"
      @open-folder="sidebarHandlers.openFolder"
      @open-path="sidebarHandlers.openPath"
      @new-file="sidebarHandlers.newFile"
      @open-settings="sidebarHandlers.openSettings"
      @select-heading="sidebarHandlers.selectHeading"
      @update:search-query="sidebarHandlers.updateSearchQuery"
      @update:replace-query="sidebarHandlers.updateReplaceQuery"
      @toggle-search-option="sidebarHandlers.toggleSearchOption"
      @replace-current="sidebarHandlers.replaceCurrent"
      @replace-all="sidebarHandlers.replaceAll"
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
        :show-path-segments="titleBarProps.showPathSegments"
        :show-tab-bar="titleBarProps.showTabBar"
        @new-file="titleBarHandlers.newFile"
        @open-file="titleBarHandlers.openFile"
        @open-folder="titleBarHandlers.openFolder"
        @save-file="titleBarHandlers.saveFile"
        @save-file-as="titleBarHandlers.saveFileAs"
        @toggle-devtools="titleBarHandlers.toggleDevTools"
        @minimize-window="titleBarHandlers.minimizeWindow"
        @maximize-window="titleBarHandlers.maximizeWindow"
        @close-window="titleBarHandlers.closeWindow"
      />

      <div class="editor-with-tabs">
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
            :pathname="editorProps.pathname"
            :workspace-root-path="editorProps.workspaceRootPath"
            :cursor="editorProps.cursor"
            :history="editorProps.history"
            :settings="settingsState"
            @editor-change="editorHandlers.editorChange"
          />
        </div>
      </div>
    </div>

    <div v-if="isSettingsOpen" class="settings-overlay" @click.self="closeSettings">
      <SettingsPanel @close="closeSettings" />
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 249, 250, 0.98));
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
  justify-content: center;
  align-items: center;
  padding: 18px;
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(8px);
}
</style>
