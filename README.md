# MarkText Modern

<p align="center">
  <img src="image/logo-placeholder.svg" alt="Project Logo" width="96" height="96">
</p>

<p align="center">
  A modernized Markdown editor project based on <strong>MarkText</strong>, focused on evolving the classic editing experience with a cleaner Electron + Vite + Vue 3 + TypeScript architecture.
</p>

<p align="center">
  <a href="README.zh-CN.md">中文说明</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/platform-Electron-blue.svg" alt="Electron">
  <img src="https://img.shields.io/badge/frontend-Vue%203-42b883.svg" alt="Vue 3">
  <img src="https://img.shields.io/badge/build-Vite-646cff.svg" alt="Vite">
</p>

## Overview

`MarkText Modern` is a modernization project built on top of the open-source **MarkText** editor.

This repository keeps the strong Markdown editing experience of the original project while gradually migrating the application to a more maintainable and future-friendly stack:

- Electron for desktop delivery
- Vite for a faster build and development workflow
- Vue 3 for the renderer layer
- TypeScript for stronger contracts and safer refactoring
- A staged bridge to legacy Muya editor capabilities

This project is not about rewriting everything from scratch. Its goals are:

- reducing historical coupling
- clarifying boundaries across main, preload, and renderer
- improving maintainability and extensibility
- creating a more stable foundation for future iterations

## Highlights

- Modern application flow centered around the `modern/` directory
- Vue 3 renderer with clearer feature-oriented organization
- TypeScript contracts for safer cross-process communication
- Cleaner separation of Electron `main / preload / renderer`
- Legacy editor capability reuse through bridging instead of brute-force rewrites
- Incremental migration strategy suitable for continuous delivery

## Project Structure

```text
.
|- image/                 README showcase image assets
|- modern/                Main modernization target and active app entry
|  |- src/main/           Electron main process
|  |- src/preload/        Preload layer and bridge APIs
|  |- src/renderer/       Vue 3 renderer application
|  |- src/shared/         Shared contracts and common types
|- src/main/              Legacy main-process implementation
|- src/renderer/          Legacy renderer implementation
|- src/muya/              Legacy editor core
```

## Preview

The images below are placeholders. You can replace the files in the `image/` directory later without changing the document.

### 1. Project Cover

![Project Cover](image/cover-placeholder.svg)

### 2. Editor Interface

![Editor Interface](image/editor-placeholder.svg)

### 3. Sidebar and Workspace

![Sidebar and Workspace](image/sidebar-placeholder.svg)

## Quick Start

### Requirements

- Node.js
- npm

### Install Dependencies

```bash
npm install
npm --prefix modern install
```

### Run the modern app

```bash
npm run modern:dev
```

### Build the modern app

```bash
npm run modern:build
```

### Type check

```bash
npm run modern:typecheck
```

## Why This Project Exists

The original MarkText project already provides a strong Markdown editing experience, but long-term maintenance becomes harder as historical code grows. This project exists to:

- carry proven capabilities into a more modern engineering structure
- make complex logic boundaries easier to understand
- reduce the risk of future refactors and feature work
- preserve room for larger-scale iteration later

## Original Project Attribution

This project is a secondary development and modernization effort based on the original open-source **MarkText** project.

- Original project: [marktext/marktext](https://github.com/marktext/marktext)
- Credit for the upstream open-source work remains with the original authors and contributors

If you are looking for the original project, historical releases, or the upstream community, please visit the upstream repository directly.

## License

This project is released under the [MIT License](LICENSE).

The original MarkText project is also MIT licensed. Please keep the related copyright
and license notices when redistributing or deriving from this codebase.
