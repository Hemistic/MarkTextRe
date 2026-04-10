<script setup lang="ts">
import contentIcon from '@legacy-assets/icons/undraw_content.svg'

interface RecentDocument {
  pathname: string
  filename: string
}

defineProps<{
  recentDocuments: RecentDocument[]
}>()

defineEmits<{
  create: []
  'open-file': []
  'open-recent': [pathname: string]
  'open-sample': []
}>()
</script>

<template>
  <div class="recent-files-projects">
    <div class="centered-group">
      <img :src="contentIcon" alt="Content" />
      <div class="actions">
        <button class="button-primary" type="button" @click="$emit('open-file')">Open Markdown</button>
        <button type="button" @click="$emit('create')">New File</button>
        <button type="button" @click="$emit('open-sample')">Open Example</button>
      </div>
    </div>

    <div class="recent-panel">
      <p class="recent-title">Recent Files</p>
      <ul v-if="recentDocuments.length > 0" class="recent-list">
        <li v-for="item in recentDocuments" :key="item.pathname" @click="$emit('open-recent', item.pathname)">
          {{ item.filename }}
        </li>
      </ul>
      <p v-else class="empty">No recent files</p>
    </div>
  </div>
</template>

<style scoped>
.recent-files-projects {
  background: var(--editorBgColor);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  padding: 40px 56px;
}

.centered-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 260px;
}

.centered-group img {
  width: 200px;
  height: auto;
}

.actions {
  display: grid;
  gap: 12px;
  width: 220px;
  margin-top: 24px;
}

.recent-panel {
  width: min(360px, 40vw);
}

.recent-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--sideBarTextColor);
}

.recent-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--editorColor10);
  border-radius: 10px;
  overflow: hidden;
  background: var(--itemBgColor);
}

.recent-list li {
  padding: 12px 14px;
  cursor: pointer;
  color: var(--editorColor80);
  border-bottom: 1px solid var(--editorColor10);
}

.recent-list li:last-child {
  border-bottom: none;
}

.recent-list li:hover {
  background: var(--sideBarItemHoverBgColor);
}

.empty {
  color: var(--sideBarTextColor);
  font-size: 13px;
}

@media (max-width: 960px) {
  .recent-files-projects {
    flex-direction: column;
    gap: 28px;
    align-items: stretch;
  }

  .centered-group,
  .recent-panel {
    width: 100%;
    min-width: 0;
  }
}
</style>
