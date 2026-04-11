<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import LegacyRecent from '../components/LegacyRecent.vue'
import LegacySidebar from '../components/LegacySidebar.vue'
import LegacyTabs from '../components/LegacyTabs.vue'
import LegacyTitleBar from '../components/LegacyTitleBar.vue'
import { useEditorWorkspace } from '../features/editor/useEditorWorkspace'

const AsyncMuyaEditor = defineAsyncComponent(() => import('../components/MuyaEditor.vue'))

const {
  editor,
  bootstrap,
  tabs,
  activeTabId,
  activeDocument,
  recentDocuments,
  headings,
  sideBarMode,
  titleFilename,
  titlePathname,
  titleDirty,
  titleWordCount,
  showHome
} = useEditorWorkspace()
</script>

<template>
  <div class="editor-container">
    <LegacySidebar
      v-model:mode="sideBarMode"
      :tabs="tabs"
      :active-tab-id="activeTabId"
      :recent-documents="recentDocuments"
      :headings="headings"
      @select-tab="editor.setActiveTab"
      @open-recent="editor.reopenRecentDocument"
      @open-file="editor.openDocument"
      @new-file="editor.createTab"
    />

    <div class="editor-middle">
      <LegacyTitleBar
        :bootstrap="bootstrap"
        :pathname="titlePathname"
        :filename="titleFilename"
        :dirty="titleDirty"
        :word-count="titleWordCount"
        :has-document="Boolean(activeDocument)"
        :show-tab-bar="true"
        @new-file="editor.createTab"
        @open-file="editor.openDocument"
        @save-file="editor.saveActiveDocument"
        @save-file-as="editor.saveActiveDocumentAs"
      />

      <div class="editor-with-tabs">
        <LegacyTabs
          v-if="tabs.length > 0"
          :tabs="tabs"
          :active-tab-id="activeTabId ?? ''"
          @select="editor.setActiveTab"
          @close="editor.closeTab"
          @create="editor.createTab"
        />

        <LegacyRecent
          v-if="showHome"
          :recent-documents="recentDocuments"
          @create="editor.createTab"
          @open-file="editor.openDocument"
          @open-recent="editor.reopenRecentDocument"
          @open-sample="editor.openSampleDocument"
        />

        <div v-else-if="activeDocument" class="editor-content">
          <component
            :is="AsyncMuyaEditor"
            :key="activeDocument.id"
            :document-id="activeDocument.id"
            :model-value="activeDocument.markdown"
            :cursor="activeDocument.cursor"
            :history="activeDocument.history"
            @update:model-value="editor.updateActiveMarkdown"
            @editor-change="editor.applyActiveEditorState"
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
