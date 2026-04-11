import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron, { startup } from 'vite-plugin-electron'
import { createCodeSplittingGroups } from './build/chunks'
import { createMuyaPlugins } from './build/muya'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = path.resolve(rootDir, '..')
const muyaRoot = path.resolve(repoRoot, 'src/muya')
const codeSplittingGroups = createCodeSplittingGroups(muyaRoot)
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
        onstart: async () => {
          await handleElectronStartup(async () => {
            await startModernElectron()
          })
        }
      }
    ])
  ],
  resolve: {
    alias: {
      '@renderer': path.resolve(rootDir, 'src/renderer'),
      '@shared': path.resolve(rootDir, 'src/shared'),
      '@legacy-assets': path.resolve(repoRoot, 'src/renderer/assets'),
      'legacy-muya': path.resolve(repoRoot, 'src/muya'),
      fs: path.resolve(rootDir, 'src/shims/fs.ts'),
      path: path.resolve(rootDir, 'src/shims/path.ts')
    }
  },
  server: {
    fs: {
      allow: [rootDir, repoRoot]
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
