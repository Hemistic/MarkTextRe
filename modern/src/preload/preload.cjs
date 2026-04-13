const { contextBridge, ipcRenderer } = require('electron')
const { createMarkTextApi } = require('./marktext-api.cjs')
const { exposeMarkTextApi } = require('./preload-support.cjs')

exposeMarkTextApi({ contextBridge, createMarkTextApi, ipcRenderer })
