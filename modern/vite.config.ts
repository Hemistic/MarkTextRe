import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron, { startup } from 'vite-plugin-electron'
import { createCodeSplittingGroups } from './build/chunks'
import { createMuyaPlugins } from './build/muya'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = path.resolve(rootDir, '..')
const muyaRoot = path.resolve(repoRoot, 'src/muya')
const codeSplittingGroups = createCodeSplittingGroups(muyaRoot)
const userHomeDir = os.homedir()
const devServerFsAllow = Array.from(new Set([
  rootDir,
  repoRoot,
  userHomeDir,
  path.parse(rootDir).root,
  path.parse(userHomeDir).root
]))
const devElectronState = {
  initialBootComplete: false
}
const startModernElectron = async () => {
  await startup(['.', '--no-sandbox'], { cwd: rootDir })
}

const handleElectronStartup = async (afterInitialBoot: () => Promise<void>) => {
  if (!devElectronState.initialBootComplete) {
    devElectronState.initialBootComplete = true
    await startModernElectron()
    return
  }

  await afterInitialBoot()
}

export default defineConfig({
  plugins: [
    vue(),
    ...createMuyaPlugins(rootDir, repoRoot),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['iconv-lite']
            }
          }
        },
        onstart: async () => {
          await handleElectronStartup(async () => {
            await startModernElectron()
          })
        }
      }
    ])
  ],
  resolve: {
    alias: [
      { find: '@renderer', replacement: path.resolve(rootDir, 'src/renderer') },
      { find: '@shared', replacement: path.resolve(rootDir, 'src/shared') },
      { find: '@legacy-assets', replacement: path.resolve(repoRoot, 'src/renderer/assets') },
      { find: 'legacy-muya', replacement: path.resolve(repoRoot, 'src/muya') },
      { find: /^dayjs$/, replacement: path.resolve(rootDir, 'src/shims/dayjs.ts') },
      { find: /^element-resize-detector$/, replacement: path.resolve(rootDir, 'src/shims/elementResizeDetector.ts') },
      { find: /^flowchart\.js$/, replacement: path.resolve(rootDir, 'src/shims/flowchart.ts') },
      { find: /^fs$/, replacement: path.resolve(rootDir, 'src/shims/fs.ts') },
      { find: /^mermaid$/, replacement: path.resolve(rootDir, 'src/shims/mermaid.ts') },
      { find: /^path$/, replacement: path.resolve(rootDir, 'src/shims/path.ts') },
      { find: /^snapsvg$/, replacement: path.resolve(rootDir, 'src/shims/snapsvg.ts') },
      { find: /^unsplash-js$/, replacement: path.resolve(rootDir, 'src/shims/unsplash.ts') },
      { find: /^vega-embed$/, replacement: path.resolve(rootDir, 'src/shims/vegaEmbed.ts') }
    ]
  },
  server: {
    fs: {
      allow: devServerFsAllow
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: 'esbuild',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: codeSplittingGroups
        }
      }
    }
  }
})
