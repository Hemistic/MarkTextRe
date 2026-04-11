import { defineStore } from 'pinia'
import { createEditorStoreRuntime } from '../features/editor/runtime'

export const useEditorStore = defineStore('editor', () => createEditorStoreRuntime())
