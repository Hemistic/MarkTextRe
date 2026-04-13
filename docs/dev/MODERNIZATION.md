# Modernization Track

This repository now contains a parallel modernization surface under [`modern/`](../../modern).

## What exists today

The legacy application remains unchanged and continues to use:

- Electron main/renderer coupling with direct renderer Electron access
- `@electron/remote`
- `nodeIntegration: true`
- `contextIsolation: false`
- Vue 2, Vuex and the `.electron-vue` webpack toolchain

The new track establishes the baseline we want to migrate toward:

- Node 24 target
- current Electron architecture with preload isolation
- Vue 3 + Pinia renderer
- Vite-based build pipeline
- typed shared contracts for IPC
- no renderer-side direct Electron imports

## What the modern shell implements

The new shell is intentionally small but executable:

- secure main window
- preload bridge
- typed IPC contracts
- open/save Markdown file flow
- tabbed workspace model
- legacy Muya mounted inside the modern Vue 3 renderer
- document metrics flowing from Muya into the Pinia store
- lightweight editor surface for migration experiments

This is the new landing zone for migrating legacy capabilities such as tabs, settings, sidebar, Muya integration, spellchecker, keybindings and export flows.

## Current migration caveats

The modernization track is intentionally favoring runtime migration progress over completeness.

- HTML export in the modern shell is currently stubbed while the old webpack-specific export pipeline is being replaced.
- Some legacy diagram dependencies still build with compatibility warnings and need follow-up cleanup.
- Bundle size is still large because legacy Muya renderers have not yet been aggressively code-split or trimmed.

## How to work with it

From the repository root:

- `npm run modern:dev`
- `npm run modern:build`
- `npm run modern:typecheck`
- `npm run modern:dist`
- `npm --prefix modern run start`

Or directly inside `modern/`:

- `npm install`
- `npm run dev`
- `npm run start`

## Planned migration order

1. Replace old renderer-to-main direct calls with preload API equivalents.
2. Port the document lifecycle and tab model.
3. Stabilize the modern Muya bridge and remove temporary fallback UI.
4. Migrate settings and file-tree capabilities.
5. Reintroduce only the platform integrations that survive Node 24 and modern Electron constraints.
