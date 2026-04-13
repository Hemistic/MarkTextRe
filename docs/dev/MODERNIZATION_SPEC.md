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
- 主进程窗口关闭对话框编排已继续拆分：
  - `close-dialogs.ts` 已接管未保存文档提示文案、response 映射和“关闭取消”提示框
  - `close-flow.ts` 已接管关闭窗口决策主链
  - `window-close-state.ts` 已接管 dirty / closing / pending close 状态追踪
  - `close-manager.ts` 现在主要只保留 renderer close 请求、IPC 响应接线与窗口事件绑定
- 主进程打开文件链路已继续拆分：
  - `open-path-coordinator-support.ts` 已接管 window ensure / activate / flush
  - `open-path-runtime-support.ts` 已接管启动参数捕获、pending queue 推进和 app 事件接线
  - `open-paths.ts` 继续向 coordinator 装配层收缩
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
  - `commandSupport.ts`
  - `commandsSupport.ts`
- `renderer` 侧 editor runtime 组装已继续收口：
  - `runtime.ts` 现在主要只负责把 editor 动作接线到 store 返回值
  - `runtimeState.ts` 现在主要只负责 refs 装配
  - 派生状态、`commandState` 组装和 recent refresh 已继续下沉到 `runtimeStateSupport.ts`
- `renderer` 侧 editor 动作装配已继续拆分：
  - `actions.ts` 已继续缩成动作装配层
  - active tab 保存动作和 active document 写入 helper 已下沉到 `actionsSupport.ts`
  - `runtime.ts` 不再同时承担“状态创建 + 动作实现”两类职责
- `renderer` 侧 editor effect 装配已继续拆分：
  - `effectSupport.ts` 已接管 session 持久化调度器、窗口关闭协调器和相关 helper
  - `effects.ts` 现在主要只保留 watch 接线与 helper 组合
- `renderer` 侧 workspace 命令绑定已继续拆分：
  - `workspaceBindings.ts` 已接管 bridge 命令注册和浏览器降级快捷键绑定
  - `useEditorWorkspace.ts` 不再手写 keydown / register / cleanup 分支
  - `useEditorWorkspace.ts` 现在显式返回 `{ editor, viewState }`，页面层开始只消费聚合后的视图状态
- `renderer/views` 侧 Home 编辑器绑定已继续拆分：
  - `homeEditorCommands.ts` 已接管 `Find / Undo / Redo` 的命令映射与执行
  - `homeEditorBindings.ts` 现在只保留快捷键/bridge 注册与 cleanup
- `renderer/views` 侧 Home 页面装配已继续收口：
  - `homeViewBindingFactory.ts` 已接管 title/sidebar/tabs/recent/editor 的 props/handlers 组装
  - `useHomeViewBindings.ts` 已缩成纯 bindings 组合层，直接接收 `view/search/refs` 切片，不再额外依赖聚合 state 对象
  - `useHomeViewService.ts` 已接管 HomeView 页面运行时装配，页面本身只保留组件消费
  - `homeViewRuntimeSupport.ts` 已接管 Home editor command executor 装配，`useHomeViewService.ts` 不再内联 undo/redo/search 执行细节
  - `useHomeSearch.ts` 已显式导出 `HomeSearchState`，搜索绑定契约不再散落在 view helper 和测试里
- `renderer/services` 已继续按协议职责拆开：
  - `appState.ts` 负责 bootstrap/session/dirty state
  - `appCommands.ts` 负责 close confirm、window close coordinator、app command 注册
  - 原混合的 `app.ts` 已删除
- `shared` 协议边界已继续收紧：
  - `contracts.ts` 已显式收口 `TocItem` 与 `WindowCloseCoordinator`
  - renderer/main 不再各自内联窗口关闭协调协议
- editor 命令层状态流转已统一：
  - 打开 / 重开 / 保存 / 关闭 tab 共用 `state.ts` 中的 workspace/status helper
  - recent document 追踪与 dirty tab close 决策已继续下沉到 `commandSupport.ts`
  - 不再在 `commands.ts` 里重复手写 tab / activeTabId / viewMode / recent / status 更新
  - `commandsWorkflowSupport.ts` 已接管 bridge 可用性守卫与 open/reopen/save/close workflow 编排，`commands.ts` 继续收缩为公开命令入口层
  - `stateWorkflowSupport.ts` 已接管 focused/save/create/sample/open/close 等 workspace transition 应用编排，`state.ts` 继续收缩为 state API 门面
- `renderer` 侧 store 壳已继续变薄：
  - `stores/editor.ts` 仅保留 Pinia 注册
  - `runtime.ts` 负责 editor 运行时状态装配与命令编排
- `renderer` 侧 bridge service 已按职责切分：
  - `services/api.ts`
  - `services/appApi.ts` 已收口 `window.marktext.app` bridge 访问与空桥接保护
  - `services/appCommands.ts`
  - `services/appCommandSupport.ts` 已拆出 close confirm fallback、window close coordinator 注册与 app command handler 安全注册
  - `services/appState.ts`
  - `services/fileApi.ts` 已收口 `window.marktext.files` bridge 访问、action 调用与通知型调用兜底
  - `services/files.ts`
  - `services/window.ts`
  - `services/windowActionSupport.ts` 已拆出窗口 bridge 解析、缺失 action fallback 与浏览器关闭兜底
  - `services/files.ts` 已收口 `getFilesApi()`、`invokeFileAction()`、`invokeFileNotification()`，文件 bridge fallback 不再散落在各个导出函数里
- `renderer` 侧文件命令链已继续 adapter 化：
  - `commandsRuntimeServices.ts` 已统一 bridge、关闭确认、文件打开/保存、recent remove 依赖
  - `filesRuntimeServices.ts` 已接管文件打开/保存 bridge service 装配
  - `commandsSupportRuntimeServices.ts` 已接管 recent remove 依赖
  - `files.ts` 与 `commandsSupport.ts` 不再直接绑死具体 renderer service
- 构建层已从兼容态 `manualChunks` 切到显式 `rolldown output.codeSplitting.groups`
- Muya 内容态 chunk 已完成第二轮拆分，`contentState` 不再整坨黏在单个大块里：
  - `muya-content-core`
  - `muya-content-runtime`
  - `muya-content-editing`
  - `muya-content-io`
  - `muya-content-features`
  - `muya-content-tables`
- Muya `contentState` 编辑链已继续做细粒度解耦：
  - `src/muya/lib/contentState/paragraphStructureMenuSupport.js` 已缩成约 `0.2KB` 的薄转发层
  - frontmatter / table picker、list menu、quote menu 已拆到 `paragraphFrontMatterSupport.js`、`paragraphListMenuSupport.js`、`paragraphQuoteSupport.js`
  - `src/muya/lib/contentState/paragraphDocumentOps.js` 已缩成薄转发层，插入/复制/删除段落与全选逻辑已拆到 `paragraphLifecycleSupport.js`、`paragraphInsertSupport.js`、`paragraphDuplicateSupport.js`、`paragraphDeleteSupport.js`、`paragraphSelectAllSupport.js`、`paragraphSelectAllRangeSupport.js`、`paragraphSelectAllDispatchSupport.js`
  - `src/muya/lib/contentState/paragraphListMenuSupport.js` 已继续缩成编排层，已有 list 类型归一化 与 多段落包裹 list 已拆到 `paragraphListTransformSupport.js`
  - `src/muya/lib/contentState/formatSupport.js` 已缩成约 `0.2KB` 的薄入口
  - inline format marker 处理、selection token 分析、format 动作编排已拆到 `formatTokenSupport.js`、`formatSelectionSupport.js`、`formatActionSupport.js`
  - `src/muya/lib/contentState/formatTokenSupport.js` 已继续缩成 re-export 壳，offset 计算 与 inline format mutation 已拆到 `formatOffsetSupport.js`、`formatInlineMutationSupport.js`
  - `src/muya/lib/contentState/updateBlockTransforms.js` 已缩成薄转发层，heading 变换与 paragraph/quote/indent-code 变换已拆到 `updateHeadingTransforms.js`、`updateParagraphTransforms.js`
  - `src/muya/lib/contentState/tableEditSupport.js` 已缩成薄转发层，table edit context、toolbar/resize、row/column mutation 已拆到 `tableEditContextSupport.js`、`tableResizeSupport.js`、`tableCellMutationSupport.js`
  - `src/muya/lib/contentState/tableResizeSupport.js` 已继续缩成编排层，table picker 分发与 resize/delete/alignment mutation 已拆到 `tableResizePickerSupport.js`、`tableResizeMutationSupport.js`
  - `src/muya/lib/contentState/clickSupport.js` 已缩成薄转发层，点击事件编排与 task checkbox 联动已拆到 `clickEventSupport.js`、`checkboxSupport.js`
  - `src/muya/lib/contentState/tableDragSupport.js` 已缩成薄转发层，drag event、drag style、table data switch 已拆到 `tableDragEventSupport.js`、`tableDragStyleSupport.js`、`tableDragDataSupport.js`
  - `src/muya/lib/contentState/tableDragDataSupport.js` 已继续缩成出口层，列交换 与 行交换 已拆到 `tableDragColumnSupport.js`、`tableDragRowSupport.js`
  - `src/muya/lib/contentState/tableDragStyleSupport.js` 已继续缩成编排层，拖拽 transform 样式应用 已拆到 `tableDragTransformSupport.js`
  - `src/muya/lib/contentState/tableSelectSupport.js` 已缩成薄转发层，table selection event、selection state、selection mutation 已拆到 `tableSelectionEventSupport.js`、`tableSelectionStateSupport.js`、`tableSelectionMutationSupport.js`
  - `src/muya/lib/contentState/enterFinalizeSupport.js` 的代码块 enter 后 cursor 决策已拆到 `enterCodeBlockCursorSupport.js`
  - `src/muya/lib/selection/cursorRangeSupport.js` 与 `rangeSelectionSupport.js` 的 selection restore 防御已拆到 `selectionRangeGuardSupport.js`
  - `src/muya/lib/contentState/renderCursorRestoreSupport.js` 已统一 render 后 cursor restore 判定与 `restore / blur / skip` 动作决策
  - `src/muya/lib/contentState/renderPipelineSupport.js` 不再直接散落恢复/失焦判断，而是通过 render cursor support 收口
  - `src/muya/lib/contentState/renderCursorFocusSupport.js` 已拆出 editor focus 与延迟 cursor restore 的 DOM 调度逻辑，`renderCursorSupport.js` 继续向游标状态编排层收缩
  - `src/muya/lib/contentState/cursorStateSupport.js` 已新增，输入/删除/剪切/语言编辑等入口开始统一检查 cursor edge 与 block 是否仍然有效
  - `src/muya/lib/contentState/runtimeDomRootSupport.js` 已拆出 editor root 定位逻辑，`runtimeDomSupport.js` 继续保留 DOM 查询装配出口
  - `src/muya/lib/contentState/renderPipelineSupport.js` 已继续收口 stale partial-render range，失效 renderRange 会回退到安全 full render，避免 Snabbdom 在断裂 DOM 上继续 diff
  - `src/muya/lib/contentState/blockTreeQuerySupport.js` 的 activeBlocks 解析已支持显式 render block 回退，single render 不再强依赖 `contentState.cursor.start`
  - `src/muya/lib/eventHandler/clickContextMenuSupport.js` 已开始尊重 `selection.setCursorRange()` 失败结果，避免右键菜单继续基于失效 cursor 派发 selection 状态
  - `src/muya/lib/contentState/arrowSupport.js` 已缩成薄转发层，table cell 跳转、选中图片/公式光标跳转、上下块导航 已拆到 `arrowTableSupport.js`、`arrowSelectionSupport.js`、`arrowMovementSupport.js`
  - `src/muya/lib/contentState/inputSupport.js` 已缩成薄转发层，token 对比、auto pair、quick insert reference 已拆到 `inputTokenSupport.js`、`inputAutoPairSupport.js`、`inputQuickInsertSupport.js`
  - `src/muya/lib/contentState/inputAutoPairSupport.js` 已继续缩成编排层，输入字符采集/配对规则与 delete/insert 分支 已拆到 `inputAutoPairRuleSupport.js`、`inputAutoPairMutationSupport.js`
  - `src/muya/lib/contentState/inputAutoPairMutationSupport.js` 已继续缩成出口层，delete 与 insert mutation 已拆到 `inputAutoPairDeleteSupport.js`、`inputAutoPairInsertSupport.js`
  - `src/muya/lib/contentState/inputEventSupport.js` 已继续缩成输入编排层，多段选区输入变更、quick insert 派发、代码块输入延迟渲染 与 普通输入渲染判定 已拆到 `inputSelectionMutationSupport.js`、`inputRenderSupport.js`
  - `src/muya/lib/contentState/inputTrailingNewlineSupport.js` 已接管尾部换行插入的特判，`inputEventSupport.js` 继续向编排层收缩
  - `src/muya/lib/contentState/searchSupport.js` 已缩成薄转发层，regex 构造/替换占位展开 与 匹配遍历/高亮跳转 已拆到 `searchRegexSupport.js`、`searchMatchSupport.js`
  - `src/muya/lib/contentState/searchMatchSupport.js` 已继续缩成出口层，替换逻辑 与 高亮导航/全文遍历 已拆到 `searchReplaceSupport.js`、`searchNavigateSupport.js`
  - `src/muya/lib/contentState/dragDropSupport.js` 已缩成薄转发层，ghost 定位、拖拽图片接收、drag/drop 事件编排 已拆到 `dragDropGhostSupport.js`、`dragDropImageSupport.js`、`dragDropEventSupport.js`
  - `src/muya/lib/contentState/dragDropEventSupport.js` 已继续改为按需加载落图支持，`dragDropImageSupport.js` 已从初始 IO 静态链剥离
  - `src/muya/lib/contentState/imageSupport.js` 已缩成薄转发层，image markdown/html 组装、图片 mutation、图片选中态切换 已拆到 `imageMarkupSupport.js`、`imageMutationSupport.js`、`imageSelectionSupport.js`
  - `src/muya/lib/contentState/imageMutationSupport.js` 已继续缩成薄转发层，图片插入 与 图片更新/替换/删除 已拆到 `imageInsertSupport.js`、`imageReplaceSupport.js`
  - `src/muya/lib/contentState/updateListTransforms.js` 已缩成薄转发层，普通 list 变换与 task list 变换 已拆到 `updateListSupport.js`、`updateTaskListSupport.js`
  - `src/muya/lib/contentState/updateListSupport.js` 已继续缩成编排层，list 文本切分 与 相邻 list merge/create 逻辑 已拆到 `updateListLineSupport.js`、`updateListMergeSupport.js`
  - `src/muya/lib/contentState/tableStructureSupport.js` 已继续缩成编排层，表格 cursor、cell/row 创建 与 表头文本解析 已拆到 `tableCursorSupport.js`、`tableCreateSupport.js`
  - `src/muya/lib/contentState/tableStructureSupport.js` 已继续缩成出口层，figure/table 创建、表格初始化 与 当前表格查询 已拆到 `tableFigureSupport.js`、`tableInitSupport.js`、`tableBlockQuerySupport.js`
  - `src/muya/lib/contentState/runtimeSupport.js` 已缩成薄转发层，初始化、runtime snapshot/history、cursor/image/table accessor 已拆到 `runtimeInitSupport.js`、`runtimeHistorySupport.js`、`runtimeAccessorSupport.js`
  - `src/muya/lib/contentState/runtimeInitSupport.js` 已继续缩成装配层，初始状态装配与 history 初始化 已拆到 `runtimeStateInitSupport.js`、`runtimeHistoryInitSupport.js`
  - `src/muya/lib/contentState/runtimeRenderLoaderSupport.js` 已引入异步 StateRender 装载，编辑器 render pipeline 不再在 `ContentState` 构造期同步拉起
  - `src/muya/lib/contentState/renderSupport.js` 已缩成薄转发层，cursor/range/reference 辅助与 render pipeline 已拆到 `renderCursorSupport.js`、`renderPipelineSupport.js`
  - `src/muya/lib/contentState/pasteSupport.js` 已缩成薄转发层，HTML 标准化与图片粘贴链 已拆到 `pasteHtmlSupport.js`、`pasteImageSupport.js`
  - `src/muya/lib/contentState/pasteImageSupport.js` 已继续缩成编排层，图片占位替换、文件粘贴与路径粘贴 已拆到 `pasteImageMutationSupport.js`、`pasteImageFileSupport.js`、`pasteImagePathSupport.js`
  - `src/muya/lib/contentState/pasteFragments.js` 已继续缩成编排层，fragment 尾块定位 与 list/paragraph merge 已拆到 `pasteFragmentMergeSupport.js`
  - `src/muya/lib/contentState/pasteHandlerSupport.js` 已继续缩成粘贴编排层，直接目标块粘贴 与 粘贴后 cursor/render 收尾 已拆到 `pasteTargetSupport.js`、`pasteFinalizeSupport.js`
  - `src/muya/lib/contentState/pasteInlineSupport.js` 已缩成 re-export 壳，代码块/语言输入/table cell/html block 粘贴分支 已拆到 `pasteCodeSupport.js`、`pasteTableSupport.js`、`pasteHtmlBlockSupport.js`
  - `src/muya/lib/contentState/pasteCtrl.js` 已改为基于 `pasteRuntimeLoaderSupport.js` 的异步入口，真正的 paste 主链已独立进入按需加载的 `muya-content-paste`
  - `src/muya/lib/contentState/pasteClassifierSupport.js` 已抽出轻量 paste/copy 分类判断，避免为同步判断重新拉起整条 paste 重链
  - `src/muya/lib/contentState/clipboardSupport.js` 已缩成薄转发层，inline/图片源恢复、代码块归一化、剪贴板 DOM 清洗 已拆到 `clipboardInlineSupport.js`、`clipboardBlockSupport.js`、`clipboardCleanupSupport.js`
  - `src/muya/lib/contentState/clipboardData.js` 已缩成编排层，代码块选区提取 与 普通选区 HTML->Markdown 提取 已拆到 `clipboardSelectionSupport.js`
  - `src/muya/lib/contentState/clipboardWrapperSupport.js` 已接管普通选区剪贴板 wrapper 的 DOM 创建与归一化，`clipboardSelectionSupport.js` 继续向数据流编排层收缩
  - `src/muya/lib/contentState/copyCutSupport.js` 已缩成薄转发层，selection cut、clipboard data、table/image/block copy 模式 已拆到 `copyCutSelectionSupport.js`、`copyCutClipboardSupport.js`、`copyCutCopySupport.js`
  - `src/muya/lib/contentState/copyCutCopySupport.js` 已继续缩成编排层，table copy 与 copyAsHtml/copyBlock/copyCodeContent 分支 已拆到 `copyCutTableSupport.js`、`copyCutModeSupport.js`
  - `src/muya/lib/contentState/enterSupport.js` 已缩成薄转发层，block 切分、list/task item 创建、table row/跨行跳转 已拆到 `enterBlockSupport.js`、`enterListSupport.js`、`enterTableSupport.js`
  - `src/muya/lib/contentState/backspaceSelectionSupport.js` 已缩成薄转发层，selection 删除分支、backspace 上下文、table/cell 删除处理 已拆到 `backspaceSelectionHandlerSupport.js`、`backspaceSelectionContextSupport.js`、`backspaceSelectionTableSupport.js`
  - `src/muya/lib/contentState/blockQuery.js` 已缩成薄转发层，tree/sibling 查询、child 元信息查询、location/descendant 导航 已拆到 `blockTreeQuerySupport.js`、`blockChildQuerySupport.js`、`blockLocationQuerySupport.js`
  - `src/muya/lib/contentState/blockManipulate.js` 已缩成薄转发层，block 删除链与插入/替换 sibling-child mutation 已拆到 `blockRemoveSupport.js`、`blockRemoveExemptionSupport.js`、`blockRemoveRangeSupport.js`、`blockRemoveMutationSupport.js`、`blockInsertSupport.js`
  - `src/muya/lib/contentState/blockState.js` 已继续缩成薄装配层，基础 block API、tree/query API、mutation API 已拆到 `blockBasicApiSupport.js`、`blockTreeApiSupport.js`、`blockMutationApiSupport.js`
  - `src/muya/lib/contentState/blockTreeApiSupport.js` 已继续缩成装配层，relation API 与 traversal API 注册 已拆到 `blockTreeRelationApiSupport.js`、`blockTreeTraversalApiSupport.js`
  - `src/muya/lib/contentState/tabListSupport.js` 已缩成薄转发层，table cell 跳转、list indent/unindent、tab 字符插入 已拆到 `tabTableSupport.js`、`tabIndentSupport.js`、`tabIndentGuardSupport.js`、`tabIndentMutationSupport.js`、`tabInsertSupport.js`
  - `src/muya/lib/contentState/paragraphTypeSupport.js` 已继续缩成编排层，span 类型判定 与 结构块类型判定 已拆到 `paragraphTypeSpanSupport.js`、`paragraphTypeBlockSupport.js`
  - `src/muya/lib/contentState/tabFormatSupport.js` 已继续缩成编排层，inline format 尾部跳出 token 解析 已拆到 `tabFormatTokenSupport.js`
  - `src/muya/lib/contentState/formatSelectionSupport.js` 已继续缩成出口层，token selection 分析 与 block format 清除 已拆到 `formatTokenSelectionSupport.js`、`formatBlockClearSupport.js`
  - `src/muya/lib/contentState/tabHtmlSupport.js` 已继续缩成编排层，HTML selector 解析 已拆到 `tabHtmlSelectorSupport.js`
  - `src/muya/lib/contentState/clickEventSupport.js` 已缩成薄转发层，点击尾段落插入、front menu、inline format click、selection format picker 已拆到 `clickParagraphSupport.js`、`clickFormatSupport.js`、`clickSelectionSupport.js`
  - `src/muya/lib/contentState/enterEventSupport.js` 已缩成薄转发层，图片选中回车、选区收敛、shift-enter、自增 table row/跳转 已拆到 `enterImageEventSupport.js`、`enterSelectionEventSupport.js`、`enterShiftSupport.js`、`enterTableEventSupport.js`
  - `src/muya/lib/contentState/backspaceCursorSupport.js` 已缩成薄转发层，inline image 回退、cell/code/footnote 边界回退、inline degrade/向前合并 已拆到 `backspaceImageCursorSupport.js`、`backspaceBlockBoundarySupport.js`、`backspaceMergeSupport.js`
  - `src/muya/lib/contentState/backspaceBlockBoundarySupport.js` 已继续缩成出口层，cell 边界、footnote 边界 与 code block 起点回退 已拆到 `backspaceCellBoundarySupport.js`、`backspaceFootnoteSupport.js`、`backspaceCodeBlockSupport.js`
  - `src/muya/lib/contentState/backspaceCtrl.js` 已继续收口为入口层，selection 阶段与 collapsed 阶段编排已拆到 `backspaceCtrlSupport.js`
  - `src/muya/lib/contentState/enterSplitSupport.js` 已缩成薄转发层，enter 上下文提取、块拆分、焦点/光标收尾 已拆到 `enterContextSupport.js`、`enterBlockSplitSupport.js`、`enterFinalizeSupport.js`
  - `src/muya/lib/contentState/enterCtrl.js` 已继续收口为入口层，enter 预处理分支与 split/finalize 编排已拆到 `enterCtrlSupport.js`
  - `src/muya/lib/contentState/enterSupport.js` 已继续缩成薄转发层，block 切分、list item 创建、空段落回车退出与 table row 后续块定位 已拆到 `enterBlockSliceSupport.js`、`enterListItemSupport.js`、`enterParagraphSupport.js`
  - `src/muya/lib/contentState/enterParagraphSupport.js` 已继续缩成出口层，空段落退出 与 table row 后续块定位/段落块解析 已拆到 `enterParagraphExitSupport.js`、`enterParagraphTableSupport.js`
  - `src/muya/lib/contentState/paragraphBlockTransforms.js` 已缩成薄转发层，code block 菜单转换、container block 插入、HTML block 初始化 已拆到 `paragraphCodeBlockSupport.js`、`paragraphContainerSupport.js`、`paragraphHtmlBlockSupport.js`
  - `src/muya/lib/contentState/updateHeadingTransforms.js` 已缩成薄转发层，thematic break、ATX header、Setext header 变换 已拆到 `updateThematicBreakSupport.js`、`updateAtxHeaderSupport.js`、`updateSetextHeaderSupport.js`
  - `src/muya/lib/contentState/backspaceSupport.js` 已缩成薄转发层，backspace 场景判断、特殊 token 回退、table 内容检测、inline degrade 已拆到 `backspaceCaseSupport.js`、`backspaceTokenSupport.js`、`backspaceTableSupport.js`、`backspaceInlineDegradeSupport.js`
  - `src/muya/lib/contentState/tableCellMutationSupport.js` 已缩成薄转发层，row/column 插入删除 已拆到 `tableRowMutationSupport.js`、`tableColumnMutationSupport.js`
  - `src/muya/lib/contentState/tableRowMutationSupport.js` 已继续缩成出口层，行插入 与 行删除 已拆到 `tableRowInsertSupport.js`、`tableRowRemoveSupport.js`
  - `src/muya/lib/contentState/tableSelectionStateSupport.js` 已继续缩成状态出口层，选区网格计算/样式应用 与 整表选中判断 已拆到 `tableSelectionCellsSupport.js`、`tableSelectionTableSupport.js`
  - `src/muya/lib/contentState/tableSelectionEventSupport.js` 已继续缩成事件出口层，mousedown/up 生命周期 与 move 框选更新 已拆到 `tableSelectionLifecycleSupport.js`、`tableSelectionMoveSupport.js`
  - `src/muya/lib/contentState/tableResizeMutationSupport.js` 已继续缩成出口层，resize 结构调整 与 toolbar 对齐/删除动作 已拆到 `tableResizeStructureSupport.js`、`tableToolActionSupport.js`
  - 新 support 文件已并入对应的 `muya-content-editing` / `muya-content-tables` 显式 chunk 归组与自动化校验
  - 新增 `input*` / `dragDrop*` / `image*` / `paste*` / `clipboard*` / `copyCut*` / `enter*` / `backspace*Support` / `block*Query*` / `block*Support` / `tab*Support` / `click*Support` 文件也已并入对应的显式 chunk 归组与自动化校验
- Muya 顶层运行时入口已开始脱离单文件总控：
  - `src/muya/lib/index.js` 已从 `15KB+` 收缩到约 `7.5KB`
  - 构造、初始化、变更分发、Markdown 同步、容器替换、销毁等职责已先下沉到 `src/muya/lib/muyaRuntimeSupport.js`
  - `src/muya/lib/muyaRuntimeSupport.js` 已继续缩成薄入口，生命周期、文档同步、选区分发、选项更新已拆到 `muyaLifecycleSupport.js`、`muyaDocumentSupport.js`、`muyaSelectionSupport.js`、`muyaOptionSupport.js`
  - `src/muya/lib/index.js` 已继续从“全部实例 API 混写”转为薄门面，文档导出/游标、命令与搜索、历史与选区、剪贴板接口已拆到 `muyaDocumentApiSupport.js`、`muyaCommandApiSupport.js`、`muyaHistoryApiSupport.js`、`muyaClipboardApiSupport.js`
  - 顶层运行时已单独进入 `muya-runtime` chunk，而不是继续混在泛用 `muya-core` 桶里
  - `src/muya/lib/contentState/index.js` 已继续从控制器清单硬编码转为薄装配层，controller 聚合已迁到 `contentState/controllerRegistry.js`
- Muya parser 层已继续做第三轮解耦：
  - `src/muya/lib/parser/index.js` 已缩成薄入口，tokenizer 主体迁移到 `src/muya/lib/parser/tokenizerSupport.js`
  - `src/muya/lib/parser/tokenizerSupport.js` 已继续缩小，validate rule / url 修正 / html tag 匹配 与 highlight/generator 输出已拆到 `tokenizerRuleSupport.js`、`tokenizerRenderSupport.js`
  - 强调规则/优先级判断与 HTML 属性/url-title 解析已拆到 `src/muya/lib/parser/emphasisSupport.js` 和 `src/muya/lib/parser/htmlSupport.js`
  - `src/muya/lib/parser/marked/lexer.js` 的 source normalization、footnote 重排、table token 归一化、fence 缩进补偿已下沉到 `src/muya/lib/parser/marked/lexerSupport.js`
  - `src/muya/lib/parser/marked/inlineLexer.js` 已缩成薄入口，inline 输出主循环已下沉到 `inlineLexerFlowSupport.js`
  - `src/muya/lib/parser/marked/inlineLexer.js` 的 rule 选择、高优先级规则集、tag 状态切换、link 归一化、codespan 归一化、autolink/url/text 渲染 helper 已下沉到 `src/muya/lib/parser/marked/inlineLexerSupport.js`
  - `src/muya/lib/parser/marked/lexer.js` 已缩成薄入口，解析主循环已下沉到 `lexerFlowSupport.js`
  - `src/muya/lib/parser/marked/lexer.js` 的基础块规则流转、list 流转、definition/table/paragraph 尾部规则已拆到 `lexerBasicFlowSupport.js`、`lexerListFlowSupport.js`、`lexerTailFlowSupport.js`
  - `src/muya/lib/parser/marked/lexerSupport.js` 已缩成 re-export 壳，source 归一化、block token 构造、list token 构造已拆到 `lexerSourceSupport.js`、`lexerBlockTokenSupport.js`、`lexerListSupport.js`
  - `src/muya/lib/parser/marked/parser.js` 已缩成薄入口，parse/next/peek/parseText 与 token switch 分别拆到 `parserCoreSupport.js`、`parserTokenSupport.js`
  - `src/muya/lib/parser/marked/renderer.js` 已拆出 block renderer 与 inline renderer，具体渲染细节下沉到 `rendererBlockSupport.js`、`rendererInlineSupport.js`
  - `src/muya/lib/parser/marked/blockRules.js` 已缩成规则装配入口，基础 block grammar 与 GFM/pedantic 变体已拆到 `blockRulesBaseSupport.js`、`blockRulesVariantSupport.js`
  - `src/muya/lib/parser/referenceLabelSupport.js` 已抽出 reference definition 收集逻辑，供渲染与图片提取共用，避免 `markdownImages` 再把整个 render pipeline 同步拉起
  - `src/muya/lib/parser/render/renderBlock/renderLeafSupport.js` 已缩成薄转发层，token resolve、preview 渲染、code/language 渲染已拆到 `renderLeafTokenSupport.js`、`renderLeafPreviewSupport.js`、`renderLeafCodeSupport.js`
  - `src/muya/lib/parser/render/index.js` 已继续收敛，StateRender 缓存/selector/reference helper 已拆到 `stateRenderHelpersSupport.js`
  - `src/muya/lib/parser/render/previewSupport.js` 已缩成 re-export 壳，preview observer 调度 与 renderer 执行 已拆到 `previewObserverSupport.js`、`previewRendererSupport.js`
  - `src/muya/lib/prism/runtimeSupport.js` 已接管 Prism 懒加载入口，`markdownState`、`codeBlockSupport`、`renderLeafCodeSupport`、`ui/codePicker` 不再同步把 Prism 主体拉进首屏渲染链
  - Prism 已继续拆成 `runtime.js` 与 `searchSupport.js` 两条加载路径，高亮运行时与语言搜索不再捆成同一个 chunk
  - `src/muya/lib/ui/emojis/runtimeSupport.js` 与 `checkSupport.js` 已把 emoji 数据搜索/校验从首屏渲染链中拆开，inline emoji 校验与 emoji picker 改为按需拉起完整 emoji 数据
  - 构建分组已新增 `muya-ui-emojis`，把 emoji 数据与 picker 从通用 `muya-ui` 启动桶中继续剥离
- Muya 图表预览链已做首轮运行时减载：
  - Mermaid / Flowchart / Sequence / PlantUML / Vega-Lite 改为进入视口后再触发具体渲染器加载
  - 不再因为页面上存在任意一个图表块，就同步预取全部图表 renderer
  - `mermaid` shim 已从 `mermaid.esm.mjs` 切回官方默认 `core` 入口，当前构建产物里此前显著膨胀的 `mindmap-definition` / `flowchart-elk-definition` 大块已不再作为常规 modern 构建输出出现
  - `vega` 相关 vendor 已继续拆成 `vendor-vega-embed` 与 `vendor-vega-lite`，不再全部混在单一 `vendor-vega` 桶里
- Muya 渲染器入口已继续从大组规则中剥离：
  - `src/muya/lib/renderers/index.js` 已缩成基于 `rendererLoadSupport.js` 的薄缓存入口
  - `katex / sequence / plantuml` 对应的 parser render 入口已继续拆成独立 chunk，避免任一 renderer 首次加载时把其余 renderer 一并拉起
  - `src/muya/lib/parser/render/**` 已从通用 `muya-parser` 归组中剥离，改入独立 `muya-render-pipeline`
  - `exportHtml.js` 已从通用 `muya-utils` 归组中剥离，改入独立 `muya-export`
  - `src/muya/lib/utils/exportHtml.js` 已继续缩成门面，header/footer 拼装 与导出渲染主链 已拆到 `exportHtmlHeaderFooterSupport.js`、`exportHtmlRenderSupport.js`
  - `katex / flowchart / vega*` 第三方依赖已补充显式 vendor 分组，便于继续观察真实大块来源
- Muya 数学渲染链已从同步首屏路径继续拆出：
  - `inline math` 与 `multiplemath` 改为按需加载 `katex`
  - 数学公式首次进入视口后再异步完成预览填充
  - `katex` 不再由编辑器初始化同步拉起
- `MuyaEditor.vue` 组件逻辑已继续下沉到 `features/muya`：
  - 搜索状态计算与查找步进已拆到 `search.ts`
  - 目录跳转 selector/scroll 计算已拆到 `navigation.ts`
  - 组件本身只保留实例生命周期、props 同步与事件桥接
  - `bridgeHelpers.ts` 已拆出 legacy default export 解包与 plugin slot 兜底，`bridge.ts` 继续向纯边界层收口
  - `sync.ts` 已拆出 `shouldEmitModelUpdateForChange()`，Muya -> model 的回写判定开始从同步主链里独立出来
  - `editorOptions.ts` 已拆出默认 Muya 编辑器选项工厂，`bridge.ts` 继续向实例装配层收缩
  - `types.ts` 已收口 Muya editor constructor / instance 契约，周边 helper 不再反向依赖 `bridge.ts`
  - `editorLifecycle.ts` 已拆出实例创建、ready 等待与 change 绑定，`bridge.ts` 进一步收缩为构造器加载与初始化编排层
- `main` 侧 IPC 注册已开始按职责拆分：
  - `app-handlers.ts`
  - `file-handlers.ts`
  - `window-handlers.ts`
  - `dialogs.ts`
- `main` 侧 IPC 装配已继续收口：
  - `app/file/window` handler 现已改成显式 handler map 工厂
  - `ipc.ts` 已成为统一的 `ipcMain.handle` 注册入口
  - 各领域 handler 文件不再各自持有 `ipcMain` 注册副作用
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
  - `main/window-state-support.ts`
  - 会保存窗口位置、尺寸和最大化状态
  - 新启动会按上次有效窗口状态恢复，而不是始终固定初始尺寸
- renderer 编辑器域已继续细分 session 序列化职责：
  - `document.ts` 保留文档摘要、tab 派生和变更应用
  - `serialization.ts` 负责 session tab 恢复、session state 序列化和 IPC 可克隆清洗
- `modern/` 已补上第一批自动化纯函数测试基线：
  - `vitest`
  - `workspace.test.ts`
  - `serialization.test.ts`
  - `commands.test.ts`
  - `commandSupport.test.ts`
  - `commandsSupport.test.ts`
  - `app-commands.test.ts`
  - `bootstrap.test.ts`
  - `effectSupport.test.ts`
  - `runtimeStateSupport.test.ts`
  - `actionsSupport.test.ts`
  - `workspaceBindings.test.ts`
  - `homeEditorCommands.test.ts`
  - `homeEditorBindings.test.ts`
  - `homeViewRuntimeSupport.test.ts`
  - `bridge.test.ts`
  - `editorLifecycle.test.ts`
  - `fileApi.test.ts`
  - `commandsWorkflowSupport.test.ts`
  - `stateWorkflowSupport.test.ts`
  - `close-flow.test.ts`
  - `close-dialogs.test.ts`
  - `window-close-state.test.ts`
  - `window-state-support.test.ts`
  - `navigation.test.ts`
  - `search.test.ts`
  - `sync.test.ts`
- 当前结构改动的最小回归验证基线固定为：
  - `npm --prefix modern run test`
  - `npm run modern:build`
  - 当前基线结果为 `73` 个测试文件、`236` 个测试通过
  - `chunks.test.ts`
  - 当前已覆盖 recent document、tab 切换、打开/保存/关闭命令流、dirty close 决策、窗口关闭状态机、窗口状态归一化/持久化辅助、session 恢复、IPC 序列化清洗、Muya bridge/sync 和 chunk 归组等无副作用逻辑
- dev/build 已稳定可跑，`npm run modern:build` 当前可通过

### 5.1 当前能力判断

- 基础 Markdown 渲染大体已恢复，可视为当前现代化版本的可用主链
- 仅看核心 Markdown 文本渲染，完成度约为 `75%~85%`
- 若把扩展能力一起计算，整体渲染完成度约为 `50%~65%`
- 当前更适合通过默认 `example.md` 做肉眼验收，而不是宣称功能已经与原版完全追平

### 5.2 2026-04-12 状态快照

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
  - `npm --prefix modern run test` 当前可通过，基线已提升到 `73/236`
  - 但仍只覆盖 editor 域纯函数，尚未进入 Electron 启动/关闭/文件流集成回归
- 主进程残余编排已继续收口：
  - `close-manager.ts` 已从窗口关闭决策中剥离出 `close-flow.ts`
  - `window-close-state.ts` 已把 dirty / closing / pending close 三类状态从 manager 内部抽离
  - `window-state.ts` 已把窗口 bounds 校验、归一化和 snapshot 生成下沉到 `window-state-support.ts`
  - `open-path-runtime-support.ts` 已把 startup path 捕获、队列推进和 `app.on` 接线从 `open-paths.ts` 中抽离
- renderer 编辑器命令层已继续收口：
  - `commandSupport.ts` 已接管 recent tracking、open/save 后状态追踪和 dirty close 分支决策
  - `commandsSupport.ts` 已接管 tab 查找、缺失 recent 文件处理等命令辅助逻辑
  - `commands.ts` 现在主要只保留 bridge 可用性判断与命令主线编排
- renderer editor runtime 装配已继续收口：
  - `runtimeStateSupport.ts` 已接管派生状态、`commandState` 和 recent refresh 组装
  - `actionsSupport.ts` 已接管 active document 写入和 active tab 保存 helper
  - `runtimeState.ts`、`actions.ts` 继续向薄装配层收缩
- Muya chunk 拆分已继续推进：
  - `muya-content-core` 已从此前约 `684KB` 收缩到当前约 `10.8KB`
  - 内容态已拆为 `editing / io / features / tables / runtime / core` 多块，support 模块也已按领域明确归组
  - Muya 顶层入口已额外拆出 `muya-runtime` 小块，当前约 `7.4KB`
  - 渲染器动态入口与渲染流水线已补上 `muya-renderers / muya-renderer-entries / muya-render-pipeline / muya-export` 显式分组，避免继续被 `muya-parser` 或 `muya-utils` 大桶吞并
  - `katex` 已从共享 vendor 大块回落到独立惰性 chunk，避免继续占用通用 vendor 预算
  - 当前剩余大块焦点已进一步收缩到 `vendor-vega-lite`，当前约 `787.70KB`
- Muya `contentState` 主干去耦已完成：
  - 旧的大型 controller 基本都已压成薄代理或聚合层
  - `blockState` 已拆为 `blockCreate / blockQuery / blockManipulate`
  - 段落、输入、回车、退格、格式化、粘贴、图片、表格编辑、表格拖拽、表格框选、点击、方向键、Tab 等高频路径都已拆出独立 support 模块
  - `contentState/index.js` 构造期状态初始化、图片/表格选中 accessor、游标历史提交逻辑已下沉到 `runtimeSupport`
  - `src/muya/lib/index.js` 顶层入口的生命周期编排已下沉到 `muyaRuntimeSupport`
  - `renderState`、`copyCutCtrl`、`pasteHandlerSupport` 已继续压薄，分别把渲染态、复制剪切、粘贴链实现细节下沉到独立 support 文件
  - `clipboardData` 与 `parser/render/index.js` 也已开始脱离“总控+实现”混写，复制归一化和预览渲染链已拆出辅助模块
  - `dragDropCtrl`、`tabCtrl` 继续瘦身，事件编排已转移到 support 层
  - 编辑器 DOM 查询已大范围改成 editor-root scoped 查询，不再默认跨整个 `document` 抓节点
  - selection/root 绑定、render pipeline guard、`stateRender` 访问 helper 已补齐，生命周期与渲染管线开始通过显式运行时边界访问渲染器
  - `contentState`、`eventHandler`、`ui` 三层的运行时直连访问已继续统一收口到 helper：
    - `runtimeDomSupport.js`
    - `runtimeEventSupport.js`
    - `runtimeOptionSupport.js`
    - `runtimeMuyaSupport.js`
    - `muyaRuntimeAccessSupport.js`
  - 编辑主链上原来直接抓 `muya.container / muya.eventCenter / muya.keyboard / muya.clipboard / muya.blur()` 的路径已基本清空，剩余引用主要只存在于 helper 内部和初始化装配点
  - 当前剩余工作主要是交互级回归验证、性能稳定性和功能迁移，不再是 Muya 结构性拆分
- 这一阶段结构重构完成度可估为 `100%`：
  - Muya 主链解耦、现代 Electron 主进程职责收拢、renderer/store/service 第一轮领域拆分已经完成
  - 后续剩余部分属于行为回归、产品能力补齐和迁移期 shim 继续收缩

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
- `muya-runtime` 已独立成小块，但 `muya-content-runtime` 与 `muya-content-io` 仍然偏大，说明 Muya 运行时和 IO 路径还有进一步拆分空间
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
  - 覆盖 workspace、editor commands、session serialization 等不依赖 Electron 窗口的路径
- 通过标准：
  - 测试必须全绿
  - 当前基线应保持 `73/236` 通过

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
