import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = path.resolve(rootDir, '..')
const muyaLibRoot = path.resolve(repoRoot, 'src/muya/lib')
const exportHtmlShimId = '\0modern-muya-export-html-shim'
const muyaSnabbdomShimId = '\0modern-muya-snabbdom-shim'
const muyaPrismLoadLanguageShimId = '\0modern-muya-prism-load-language-shim'
const require = createRequire(import.meta.url)
const muyaPackageOverrides = {
  '@marktext/file-icons': path.resolve(rootDir, 'src/shims/fileIcons.ts'),
  dompurify: path.resolve(rootDir, 'src/shims/dompurify.ts'),
  execall: path.resolve(rootDir, 'src/shims/execall.ts'),
  fuzzaldrin: path.resolve(rootDir, 'src/shims/fuzzaldrin.ts'),
  'html-tags': path.resolve(rootDir, 'src/shims/htmlTags.ts'),
  'html-tags/void': path.resolve(rootDir, 'src/shims/htmlVoidTags.ts'),
  katex: path.resolve(rootDir, 'src/shims/katex.ts'),
  'katex/dist/contrib/mhchem.min.js': path.resolve(rootDir, 'src/shims/katexMhchem.ts'),
  path: path.resolve(rootDir, 'src/shims/path.ts'),
  prismjs: path.resolve(rootDir, 'src/shims/prism.ts'),
  'prismjs/components.js': path.resolve(rootDir, 'src/shims/prismComponents.ts'),
  'prismjs/dependencies': path.resolve(rootDir, 'src/shims/prismDependencies.ts'),
  snapsvg: path.resolve(rootDir, 'src/shims/snapsvg.ts'),
  turndown: path.resolve(rootDir, 'src/shims/turndown.ts'),
  underscore: path.resolve(rootDir, 'src/shims/underscore.ts'),
  webfontloader: path.resolve(rootDir, 'src/shims/webfontloader.ts'),
  zlib: path.resolve(rootDir, 'src/shims/zlib.ts')
}
const isBareSpecifier = (source: string) => !source.startsWith('.') && !source.startsWith('/') && !source.startsWith('\0')

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'modern-muya-export-html-shim',
      enforce: 'pre',
      resolveId (source, importer) {
        if (!importer) {
          return null
        }

        const normalizedImporter = importer.split(path.sep).join('/')
        const normalizedMuyaRoot = muyaLibRoot.split(path.sep).join('/')

        if (
          normalizedImporter.startsWith(normalizedMuyaRoot) &&
          (source === './utils/exportHtml' || source === '../utils/exportHtml')
        ) {
          return exportHtmlShimId
        }

        return null
      },
      load (id) {
        if (id === exportHtmlShimId) {
          return `
export const getSanitizeHtml = () => ''

export default class ExportHtml {
  constructor (_markdown, _muya) {}

  generate () {
    return ''
  }

  renderHtml () {
    return ''
  }
}
`
        }

        return null
      }
    },
    {
      name: 'modern-muya-snabbdom-shim',
      enforce: 'pre',
      resolveId (source, importer) {
        if (!importer) {
          return null
        }

        const normalizedImporter = importer.split(path.sep).join('/')
        const normalizedMuyaRoot = muyaLibRoot.split(path.sep).join('/')

        if (
          normalizedImporter.startsWith(normalizedMuyaRoot) &&
          (source === './snabbdom' || source === '../snabbdom' || source === '../../parser/render/snabbdom')
        ) {
          return muyaSnabbdomShimId
        }

        return null
      },
      load (id) {
        if (id === muyaSnabbdomShimId) {
          return `
export {
  patch,
  h,
  toVNode,
  toHTML,
  htmlToVNode
} from ${JSON.stringify(path.resolve(rootDir, 'src/shims/muyaSnabbdom.ts'))}
`
        }

        return null
      }
    },
    {
      name: 'modern-muya-prism-load-language-shim',
      enforce: 'pre',
      resolveId (source, importer) {
        if (!importer) {
          return null
        }

        const normalizedImporter = importer.split(path.sep).join('/')
        const normalizedPrismIndex = path.resolve(muyaLibRoot, 'prism/index.js').split(path.sep).join('/')

        if (normalizedImporter === normalizedPrismIndex && source === './loadLanguage') {
          return muyaPrismLoadLanguageShimId
        }

        return null
      },
      load (id) {
        if (id === muyaPrismLoadLanguageShimId) {
          return `
export {
  default,
  loadedLanguages,
  transformAliasToOrigin
} from ${JSON.stringify(path.resolve(rootDir, 'src/shims/muyaPrismLoadLanguage.ts'))}
`
        }

        return null
      }
    },
    {
      name: 'modern-muya-package-resolver',
      enforce: 'pre',
      resolveId (source, importer) {
        if (!importer || !isBareSpecifier(source)) {
          return null
        }

        const normalizedImporter = importer.split(path.sep).join('/')
        const normalizedMuyaRoot = muyaLibRoot.split(path.sep).join('/')

        if (!normalizedImporter.startsWith(normalizedMuyaRoot)) {
          return null
        }

        if (source in muyaPackageOverrides) {
          return muyaPackageOverrides[source as keyof typeof muyaPackageOverrides]
        }

        try {
          return require.resolve(source, {
            paths: [rootDir]
          })
        } catch {
          return null
        }
      }
    },
    electron({
      main: {
        entry: 'src/main/index.ts'
      },
      preload: {
        input: {
          index: 'src/preload/index.ts'
        }
      },
      renderer: {}
    })
  ],
  resolve: {
    alias: {
      '@renderer': path.resolve(rootDir, 'src/renderer'),
      '@shared': path.resolve(rootDir, 'src/shared'),
      '@legacy-assets': path.resolve(repoRoot, 'src/renderer/assets'),
      'legacy-muya': path.resolve(repoRoot, 'src/muya')
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
    cssMinify: 'esbuild'
  }
})
