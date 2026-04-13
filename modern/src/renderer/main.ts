import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router'
import { ensureLegacyDiagramGlobals } from './services/legacyScripts'
import './style.css'

const bootstrap = async () => {
  await ensureLegacyDiagramGlobals()

  const app = createApp(App)
  const pinia = createPinia()
  const router = createRouter({
    history: createWebHashHistory(),
    routes
  })

  app.use(pinia)
  app.use(router)
  app.mount('#app')
}

void bootstrap()
