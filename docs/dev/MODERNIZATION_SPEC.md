# MarkText Modernization Spec

## 1. 目标

本项目的现代化重构目标不是在原有 `electron-vue + Vue 2 + Webpack + Node < 17` 架构上继续修补，而是建立一套新的、可维护的、可持续演进的应用骨架，并逐步替换旧实现。

目标约束如下：

- Node 固定为 `24.x`
- Electron 使用现代主进程/预加载/渲染进程分层
- 前端使用 `Vite + Vue 3 + TypeScript + Pinia`
- 保留 MarkText 原有产品外观和核心交互，不做重新设计
- 优先解决原架构的耦合、历史包袱、运行时不稳定和构建脆弱性
- 新代码结构必须简单、可测试、边界清晰，避免继续制造新的“屎山”

## 2. 非目标

以下事项不属于当前阶段目标：

- 不在旧 `src/` 应用内继续大规模堆补丁
- 不追求一次性迁移全部旧功能后再交付
- 不引入复杂微前端、RPC 框架、DI 容器、状态机框架等额外复杂度
- 不为了“现代”而更换为与当前代码基础不匹配的技术栈，例如 React/Tauri/Nest

## 3. 重构原则

### 3.1 替换优先于修补

旧代码的问题不是某几个 bug，而是架构层面的耦合、边界不清、历史兼容物过多。解决方式应以 `modern/` 作为新的主开发面，采用逐步替换，而不是继续在旧壳上做深修。

### 3.2 主进程负责系统行为

所有窗口、文件系统、系统菜单、对话框、生命周期控制都由主进程负责。渲染层只表达用户意图，不负责系统级状态仲裁。

### 3.3 预加载层只做桥接

预加载层只暴露最小 IPC API，不承载业务逻辑，不依赖复杂打包行为，不使用脆弱的动态编译技巧。

### 3.4 渲染层只处理界面与编辑状态

渲染层负责：

- 页面布局
- 文档状态
- 编辑器状态
- 用户操作意图

渲染层不负责：

- 文件真实读写
- 窗口生命周期
- 系统对话框决策
- Electron 进程管理

### 3.5 兼容层是临时债务，不是长期结构

当前 Muya 兼容层、第三方包 shim、旧模块适配仅作为迁移过渡。所有 shim 都必须被视为待消除对象，而不是长期核心依赖。

## 4. 目标技术架构

### 4.1 技术选型

- Runtime: Node 24
- Desktop shell: Electron 41+
- Build: Vite 8
- UI: Vue 3
- Language: TypeScript
- State: Pinia
- Packaging: electron-builder

### 4.2 目标目录结构

`modern/` 是新应用根目录，目标结构如下：

```text
modern/
  src/
    main/        # Electron 主进程
    preload/     # 仅桥接 API
    renderer/    # Vue 应用
      app/       # 应用装配、router、providers
      components/
      features/  # 按业务域拆分
      stores/
      services/  # 渲染层纯业务服务
      views/
      styles/
    shared/      # 主进程/渲染进程共享类型和协议
    shims/       # 迁移期兼容层，最终逐步消除
  vite.config.ts
  package.json
```

### 4.3 分层职责

#### main

负责：

- BrowserWindow 创建与销毁
- 文件打开/保存
- 最近文件与 session 持久化
- 系统菜单
- 原生对话框
- 未保存文档的退出确认
- 应用生命周期

禁止：

- UI 状态拼装
- 编辑器内部逻辑
- 直接操作 DOM

#### preload

负责：

- 暴露稳定、最小、显式的 API
- 统一 IPC channel 映射

禁止：

- 业务判断
- 状态存储
- 复杂构建时转换

#### renderer

负责：

- 原版 MarkText 外观复刻
- 文档 tab 状态
- 编辑器数据流
- 页面交互

禁止：

- 直接使用 Node API
- 绕过 preload 调主进程能力

## 5. 当前已落地内容

截至当前阶段，已经完成如下内容：

- `modern/` 独立工作区已建立
- 根脚本已接入 `modern:dev/build/dist/start/typecheck`
- 新栈已切到 `Node 24 + Electron + Vite + Vue 3 + TS + Pinia`
- 基础 UI 外壳已恢复到接近原版 MarkText，保留旧版视觉方向而非重新设计
- 文档核心流已具备：
  - 新建
  - 打开
  - 最近文件
  - 保存
  - 另存为
  - 示例文档
  - tab 模型
  - session 持久化
- Muya 已接入现代渲染壳，基础 Markdown 渲染主链已可用
- 应用在无可恢复 session 时会默认打开 `example.md`，用于直接检查 Markdown 渲染覆盖度
- 示例文档已替换为覆盖 `CommonMark + GFM + 常见扩展` 的验收样例，包含：
  - front matter
  - headings
  - links
  - lists
  - task lists
  - blockquotes
  - code fences
  - indented code
  - tables
  - images
  - raw HTML
  - footnotes
  - math
  - mermaid
  - flowchart
  - sequence
  - vega-lite
- 主进程已接管窗口关闭流程，未保存文档整窗关闭确认已回到原生对话框链路
- 关闭窗口时支持 `Save All / Discard / Cancel`
- preload 已改为静态 CommonJS 文件，避免不稳定的 dev 编译链
- `renderer` 侧已开始按领域拆分：
  - `document.ts`
  - `workspace.ts`
  - `files.ts`
  - `session.ts`
- `renderer` 侧副作用 wiring 已继续收敛：
  - `effects.ts` 已接管 session 持久化 watch 与关闭窗口协调桥接
- `renderer` 侧命令编排已继续下沉：
  - `bootstrap.ts`
  - `state.ts`
  - `commands.ts`
- `renderer` 侧 store 壳已继续变薄：
  - `stores/editor.ts` 仅保留 Pinia 注册
  - `runtime.ts` 负责 editor 运行时状态装配与命令编排
- `renderer` 侧 bridge service 已按职责切分：
  - `services/api.ts`
  - `services/app.ts`
  - `services/files.ts`
  - `services/window.ts`
- 构建层已从兼容态 `manualChunks` 切到显式 `rolldown output.codeSplitting.groups`
- Muya 内容态 chunk 已完成第二轮拆分，`contentState` 不再整坨黏在单个大块里：
  - `muya-content-core`
  - `muya-content-runtime`
  - `muya-content-editing`
  - `muya-content-io`
  - `muya-content-features`
  - `muya-content-tables`
- Muya 图表预览链已做首轮运行时减载：
  - Mermaid / Flowchart / Sequence / PlantUML / Vega-Lite 改为进入视口后再触发具体渲染器加载
  - 不再因为页面上存在任意一个图表块，就同步预取全部图表 renderer
- Muya 数学渲染链已从同步首屏路径继续拆出：
  - `inline math` 与 `multiplemath` 改为按需加载 `katex`
  - 数学公式首次进入视口后再异步完成预览填充
  - `katex` 不再由编辑器初始化同步拉起
- `main` 侧 IPC 注册已开始按职责拆分：
  - `app-handlers.ts`
  - `file-handlers.ts`
  - `window-handlers.ts`
  - `dialogs.ts`
- 主进程已补回第一版原生应用菜单：
  - `main/menu.ts`
  - `File` 菜单可通过主进程原生命令分发触发 `New / Open / Save / Save As`
  - `Open Recent` 已由主进程基于最近文件存储动态生成
  - `Open Recent` 已补上 `Clear Recent Files`
  - `Edit / View / Window` 已接回 Electron 原生 role
- `preload` 与 `renderer` 之间已补充轻量命令桥：
  - `app.registerAppCommandHandler()`
  - renderer 侧新增 `app-commands.ts` 统一处理原生菜单命令、路径打开命令与浏览器回退快捷键
- 应用启动壳已补回第一版系统打开文件链：
  - 单实例锁已启用
  - 启动参数里的 Markdown 文件会在渲染层准备完成后自动打开
  - `open-file` 事件与第二实例传文件会复用同一条 `open-path` 命令分发链
  - 该链路已从 `main/index.ts` 抽离到 `main/open-paths.ts`，避免主入口继续堆编排逻辑
- 主进程窗口状态已补回持久化：
  - `main/window-state.ts`
  - 会保存窗口位置、尺寸和最大化状态
  - 新启动会按上次有效窗口状态恢复，而不是始终固定初始尺寸
- renderer 编辑器域已继续细分 session 序列化职责：
  - `document.ts` 保留文档摘要、tab 派生和变更应用
  - `serialization.ts` 负责 session tab 恢复、session state 序列化和 IPC 可克隆清洗
- `modern/` 已补上第一批自动化纯函数测试基线：
  - `vitest`
  - `workspace.test.ts`
  - `serialization.test.ts`
  - 当前已覆盖 recent document、tab 切换、session 恢复、IPC 序列化清洗等无副作用逻辑
- dev/build 已稳定可跑，`npm run modern:build` 当前可通过

### 5.1 当前能力判断

- 基础 Markdown 渲染大体已恢复，可视为当前现代化版本的可用主链
- 仅看核心 Markdown 文本渲染，完成度约为 `75%~85%`
- 若把扩展能力一起计算，整体渲染完成度约为 `50%~65%`
- 当前更适合通过默认 `example.md` 做肉眼验收，而不是宣称功能已经与原版完全追平

### 5.2 2026-04-10 状态快照

当前阶段的明确状态如下：

- `modern/` 已成为唯一现代化主线，旧 `src/` 仅作为迁移参考
- 现代栈已稳定切换到：
  - Node `24.x`
  - Electron `41`
  - Vite `8`
  - Vue `3`
  - TypeScript
  - Pinia
- 主进程已接管窗口关闭仲裁，整窗关闭时会走原生 `Save All / Discard / Cancel`
- 默认启动逻辑已调整为：
  - 有可恢复 session 时优先恢复
  - 没有可恢复 session 时自动打开默认 `example.md`
- 默认 `example.md` 已升级为完整 Markdown/GFM/扩展验收样例
- `npm run modern:build` 当前可稳定通过
- 当前构建剩余警告主要集中在 chunk 体积和旧依赖兼容，并非主链失败
- dev 侧已顺手清理掉 Muya 主题 CSS 中的 `@import` 顺序警告源
- 原生菜单主链已恢复第一版：
  - 主进程负责菜单定义与 accelerator
  - 渲染层只接收 `AppCommand` 并复用现有 editor command
  - 浏览器预览模式仍保留 `keydown` 回退，不依赖 Electron 菜单
  - 最近文件菜单会在打开/保存/移除最近文件后由主进程自动刷新
- 自动化验证不再完全为零：
  - `npm --prefix modern run test` 当前可通过
  - 但仍只覆盖 editor 域纯函数，尚未进入 Electron 启动/关闭/文件流集成回归
- Muya chunk 拆分已继续推进：
  - `muya-content-core` 已从此前约 `684KB` 收缩到约 `3.4KB`
  - 内容态已拆为 `editing / io / features / tables / runtime / core` 多块
  - `katex` 已从共享 vendor 大块回落到独立惰性 chunk，避免继续占用通用 vendor 预算
  - 当前剩余大块焦点已转移到 `muya-content-runtime`、`vega-embed`、`mindmap-definition`、`flowchart-elk-definition`
- Muya `contentState` 主干去耦已进入收口阶段：
  - 旧的大型 controller 基本都已压成薄代理或聚合层
  - `blockState` 已拆为 `blockCreate / blockQuery / blockManipulate`
  - 段落、输入、回车、退格、格式化、粘贴、图片、表格编辑、表格拖拽、表格框选、点击、方向键、Tab 等高频路径都已拆出独立 support 模块
  - 现阶段剩余复杂度主要存在于局部 support 业务逻辑和交互级回归验证，而不再是核心入口层纠缠
- 这一阶段结构重构完成度可估为 `95%~97%`：
  - 已完成部分是 Muya 主链解耦、现代 Electron 主进程职责收拢、renderer/store/service 第一轮领域拆分
  - 剩余部分主要是交互级测试补强、少量尾部模块整理和进一步消除迁移期兼容层

## 5.3 立即执行队列

在当前状态下，后续执行顺序固定如下：

1. 在现有 Muya 拆分基础上，补交互级回归验证
2. 继续收尾 `renderer` 与 `main` 领域边界中的残余编排耦合
3. 继续处理少量剩余大 chunk 与迁移期 shim
4. 在功能迁移扩大之前，建立更可靠的手工烟测与自动化验证基线

## 6. 当前主要问题

以下问题仍然存在，且是下一阶段重构重点：

### 6.1 Muya 迁移仍依赖大量兼容层

- `shims/` 过多
- 旧依赖导出形式不统一
- 动态语言加载、渲染依赖和老包兼容仍然脆弱
- `muya-content-core` 已被压到很小，但 `muya-content-runtime` 仍然偏大，说明 `contentState/index.js` 及其剩余同步依赖仍未彻底去耦
- `mermaid` 主包已缩小，但 `flowchart-elk`、`mindmap` 等子图块仍然偏大
- `katex` 已不再占用共享 vendor 大块，但数学链仍有单独惰性 chunk，后续只需继续核查是否还有不必要的间接引用

### 6.2 新架构还未彻底完成按领域拆分

- `renderer/stores/editor.ts` 已开始瘦身，但仍然承担过多编排职责
- `features/editor/runtime.ts` 已接过一部分 store 编排，但 `documents/session/recent/window` 的边界还没完全稳定
- `renderer/services/` 已完成第一轮按协议拆分，但仍缺少更细的导出、设置、偏好等服务域
- `documents/session/recent/window/editor runtime` 还没有全部落到稳定边界
- 自动化验证逻辑仍未进入结构内，只能依赖手工回归

### 6.3 与原版功能仍有明显差距

- 当前已经恢复核心文档流与核心 Markdown 主渲染
- 但大量产品级能力尚未迁移，例如：
  - 全局搜索/替换 UI
  - 设置与偏好
  - 导出链路
  - 完整菜单系统
  - 多窗口
  - 更完整的目录/侧边栏交互
  - 高级编辑器能力的完整迁移

### 6.4 自动化验证不足

- 主要依靠手工烟测
- 没有建立稳定的启动、打开、保存、关闭回归测试
- 目前最可靠的手工验收方式已经更新为：
  - 先运行 `npm --prefix modern run test`
  - 再运行 `npm run modern:dev`
  - 冷启动后检查默认打开的 `example.md` 是否完整渲染
  - 手工验证打开、编辑、保存、关闭窗口、表格选择/拖拽、公式、图片、列表缩进、回车、退格、粘贴

## 6.5 当前测试方法

当前阶段测试方法不再只是“能启动就算过”，而是拆成三层：

### 纯逻辑验证

- 命令：`npm --prefix modern run test`
- 目的：
  - 验证 `modern/` 下当前已拆出的纯函数与可序列化状态逻辑
  - 覆盖 workspace、session serialization 等不依赖 Electron 窗口的路径
- 通过标准：
  - 测试必须全绿
  - 当前基线应保持 `7/7` 通过

### 构建验证

- 命令：`npm run modern:build`
- 目的：
  - 验证现代工作区在当前依赖和构建配置下仍可完整构建
  - 防止 renderer/main/preload 改动破坏打包主链
- 说明：
  - Windows 文件系统偶发异常需要和源码回归区分，不应把随机 IO 问题误判为逻辑失败

### 交互烟测

- 命令：`npm run modern:dev`
- 推荐烟测顺序：
  1. 冷启动应用
  2. 确认默认自动打开 `example.md`
  3. 检查 headings / list / table / code / math / diagram / html / footnote 基础渲染
  4. 选中并编辑长文档，确认滚动、光标、选区、格式化行为正常
  5. 验证表格单元格选择、拖拽、删除、行列编辑
  6. 验证打开、保存、另存为、最近文件、关闭窗口确认
  7. 验证关闭窗口后进程能正常退出

当前结论：

- `npm --prefix modern run test` 已可稳定通过
- `npm run modern:build` 处于可用状态，但仍需要继续观察 Windows 环境随机 IO 问题
- 真正的下一阶段重点是把 `modern:dev` 手工烟测逐步沉淀成更可靠的集成回归，而不是继续单纯拆文件

## 7. 迁移策略

采用 `Strangler Fig` 式替换策略：

1. 新架构先承担主运行路径
2. 从旧代码中只迁移必要功能和必要模块
3. 每迁移一块，就在 `modern/` 中落成稳定边界
4. 迁移完成后逐步删除 shim 和旧依赖

禁止继续让 `modern/` 反向继承旧架构缺陷。

## 8. 后续执行顺序

### Phase 1: 运行时稳定性

目标：把应用启动、关闭、文件打开保存做成稳定主路径。

必须完成：

- 主进程接管窗口关闭、退出、最小化、最大化
- 未保存文档关闭确认改成主进程原生方案
- dev 模式与 build 模式的 preload 行为一致化
- 清理临时日志、开发态遗留文件

验收标准：

- `npm run modern:dev` 可稳定启动
- 点击窗口关闭可稳定退出
- 打开/保存/另存为无明显回归

当前状态：

- 已基本完成
- 后续只保留回归验证和残余边角收口

### Phase 2: 结构清理

目标：把当前能跑但不干净的结构收整为长期可维护结构。

必须完成：

- 拆分 `editor` store
- 抽离 `documents/session/recent/window` 等服务
- 收紧 shared contract
- 减少 renderer 直接感知 Electron 细节

验收标准：

- 主流程模块边界清晰
- 大文件被拆分
- 不再出现“一个 store 管全部应用行为”的结构

当前状态：

- 已启动并持续推进
- `document/workspace/files/session` 已拆出第一版边界
- `editor` store 已明显瘦身
- Muya `contentState` 主干高耦合块已基本拆开，后续以交互回归补强为主

### Phase 3: Muya 去债

目标：把临时兼容层控制在最小范围。

必须完成：

- 盘点所有 shim 的必要性
- 优先替换最脆弱、最难调试的 shim
- 统一第三方依赖导出方式
- 处理动态导入、样式导入、老 CommonJS/ESM 兼容问题

验收标准：

- shim 数量显著减少
- dev/build/runtime 三态一致性提高

当前状态：

- 已开始，但仍是当前最大技术债
- 打包层的大块问题已从“整包失控”收敛为“少数重块仍大”
- Muya 主链同步耦合已从核心入口层明显收缩
- 下一阶段重点不再是继续机械拆分 controller，而是验证拆分后的行为一致性并继续减少迁移期 shim

### Phase 4: 功能迁移

目标：逐步追平原版核心功能，而不是只保留一个演示壳。

优先顺序：

1. 基础编辑稳定性
2. 文档管理能力
3. 视图/目录/侧边栏一致性
4. 导出、主题、偏好设置
5. 其余高级能力

当前状态：

- 已完成核心文档流和核心渲染主链
- 尚未进入大面积高级功能迁移阶段

## 9. 代码结构约束

后续所有实现必须遵守以下约束：

- 不在 renderer 直接使用 Node API
- 不重新引入 Vue 2 时代的全局可变单例模式
- 不把业务逻辑塞进 preload
- 不把窗口生命周期决策塞回渲染层
- 不继续扩散 shim 范围
- 一个模块只负责一类明确职责
- 优先纯函数和可序列化状态

## 10. 完成标准

满足以下条件时，才可认为“现代化重构基本完成”：

- 现代工作区可以独立开发、构建、打包
- 主进程、预加载、渲染层职责稳定
- 原版核心体验已基本恢复
- 关键流程稳定：
  - 启动
  - 新建
  - 打开
  - 保存
  - 关闭 tab
  - 关闭窗口
- Muya 兼容层显著收缩
- 新代码结构可继续扩展，而不是新的屎山

## 11. 当前执行结论

本项目后续不应继续以“修旧项目”为主线，而应以 `modern/` 为唯一主线推进。

旧架构只作为功能参考和迁移素材，不再作为未来实现基础。

当前更具体的执行结论如下：

- 现代化主线已经有效跑通，项目不再停留在“架子工程”
- 当前版本已具备用于人工验收核心 Markdown 渲染的最低可用状态
- 下一阶段最值得投入的方向不是再修旧页面，而是：
  - 补交互级回归验证
  - 收尾少量残余编排耦合
  - 在功能迁移前建立更可靠的验收样例、测试方法与回归路径
