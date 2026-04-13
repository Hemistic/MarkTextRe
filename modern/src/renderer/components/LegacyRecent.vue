<script setup lang="ts">
import contentIcon from '@legacy-assets/icons/undraw_content.svg'
import { useI18n } from '../i18n'

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

const { t } = useI18n()
</script>

<template>
  <div class="recent-files-projects">
    <div class="centered-group">
      <img :src="contentIcon" alt="Content" />
      <div class="actions">
        <button class="button-primary" type="button" @click="$emit('open-file')">{{ t('Open Markdown') }}</button>
        <button type="button" @click="$emit('create')">{{ t('New File') }}</button>
        <button type="button" @click="$emit('open-sample')">{{ t('Open Example') }}</button>
      </div>
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
  padding: 48px 56px;
}

.centered-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 280px;
  padding: 28px 26px;
  border: 1px solid var(--surfaceBorderColor);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(250, 250, 250, 0.78));
  box-shadow: var(--surfaceShadowSoft);
}

.centered-group img {
  width: 216px;
  height: auto;
}

.actions {
  display: grid;
  gap: 12px;
  width: 228px;
  margin-top: 24px;
}

@media (max-width: 960px) {
  .recent-files-projects {
    flex-direction: column;
    gap: 28px;
    align-items: stretch;
  }

  .centered-group {
    width: 100%;
    min-width: 0;
  }
}
</style>
