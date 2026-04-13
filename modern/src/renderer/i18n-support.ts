export type RendererLocale = 'en' | 'zh-CN'

type TranslationTable = Record<string, string>

const ZH_CN_MESSAGES: TranslationTable = {
  Settings: '设置',
  'Legacy preferences migrated into the modern shell.': '旧版偏好设置已迁移到现代化壳层。',
  Close: '关闭',
  General: '通用',
  Editor: '编辑器',
  Markdown: 'Markdown',
  Theme: '主题',
  Image: '图片',
  Spelling: '拼写',
  'Auto Save': '自动保存',
  'Automatically save document changes': '自动保存文档更改',
  'Save delay': '保存延迟',
  Window: '窗口',
  'Title bar style': '标题栏样式',
  Custom: '自定义',
  Native: '原生',
  'Hide scrollbars': '隐藏滚动条',
  'Show tab bar': '显示标签栏',
  'Open files in new window': '在新窗口中打开文件',
  'Open folders in new window': '在新窗口中打开文件夹',
  Zoom: '缩放',
  Sidebar: '侧边栏',
  'Show sidebar panel': '显示侧边栏面板',
  'Wrap text in table of contents': '目录文本自动换行',
  'Sort files by': '文件排序方式',
  'Creation time': '创建时间',
  'Modification time': '修改时间',
  Title: '标题',
  Startup: '启动',
  'Startup action': '启动行为',
  'Choose whether to restore the last session, open a default folder, or start blank.': '选择恢复上次会话、打开默认文件夹，或启动空白页。',
  'Open default folder': '打开默认文件夹',
  'Restore last session': '恢复上次会话',
  'Open blank page': '打开空白页',
  'Default directory to open': '默认打开目录',
  'Select a folder': '选择文件夹',
  'Used when startup action is set to open a default folder.': '当启动行为设为打开默认文件夹时使用。',
  Misc: '杂项',
  'Interface language': '界面语言',
  English: '英语',
  'Chinese (Simplified)': '简体中文',
  'Text Editor': '文本编辑器',
  'Font size': '字体大小',
  'Line height': '行高',
  'Font family': '字体',
  'Maximum editor width': '编辑器最大宽度',
  'Leave empty for theme default, or use values like 72ch, 900px, or 80%.': '留空则使用主题默认值，或填写 72ch、900px、80% 之类的值。',
  'Code Blocks': '代码块',
  'Remove leading and trailing empty lines': '移除首尾空白行',
  'Writing Behavior': '输入行为',
  'Automatically close brackets': '自动闭合括号',
  'Automatically complete Markdown syntax': '自动补全 Markdown 语法',
  'Automatically close quotation marks': '自动闭合引号',
  'File Representation': '文件表示',
  'Preferred tab width': '首选制表宽度',
  'Line separator': '换行符',
  Default: '默认',
  CRLF: 'CRLF',
  LF: 'LF',
  'Default encoding': '默认编码',
  'Automatically detect file encoding': '自动检测文件编码',
  'Trailing newline handling': '尾部换行处理',
  'Trim all trailing': '去除所有尾部换行',
  'Ensure exactly one trailing': '确保仅保留一个尾部换行',
  'Preserve original style': '保留原始样式',
  'Do nothing': '不处理',
  'Text direction': '文本方向',
  'Left to Right': '从左到右',
  'Right to Left': '从右到左',
  'Hide quick insert hint': '隐藏快速插入提示',
  'Hide link popup on hover': '悬停时隐藏链接弹窗',
  'Automatically check related tasks': '自动勾选相关任务',
  Lists: '列表',
  'Prefer loose list items': '优先使用宽松列表项',
  'Bullet list marker': '无序列表标记',
  'Ordered list delimiter': '有序列表分隔符',
  'List indentation': '列表缩进',
  Extensions: '扩展',
  'Front matter format': 'Front matter 格式',
  YAML: 'YAML',
  TOML: 'TOML',
  'JSON (;;;)': 'JSON (;;;)',
  'JSON ({})': 'JSON ({})',
  'Enable superscript and subscript': '启用上标和下标',
  'Enable footnotes': '启用脚注',
  Compatibility: '兼容性',
  'Enable HTML rendering': '启用 HTML 渲染',
  'Enable GitLab compatibility mode': '启用 GitLab 兼容模式',
  Diagrams: '图表',
  'Sequence diagram theme': '时序图主题',
  'Hand drawn': '手绘',
  Simple: '简洁',
  'Preferred heading style': '首选标题样式',
  'ATX heading': 'ATX 标题',
  'Setext heading': 'Setext 标题',
  Appearance: '外观',
  'Auto switch theme': '自动切换主题',
  Light: '浅色',
  Dark: '深色',
  Graphite: '石墨',
  'Material Dark': 'Material Dark',
  Ulysses: 'Ulysses',
  'One Dark': 'One Dark',
  'Adjust at startup': '启动时调整',
  'Only at runtime': '仅运行时调整',
  Never: '从不',
  'Insert Behavior': '插入行为',
  'Default action after inserting a local image': '插入本地图片后的默认操作',
  'Copy to global or relative folder': '复制到全局或相对目录',
  'Keep original location': '保留原始位置',
  Folders: '文件夹',
  'Global image folder': '全局图片目录',
  'Prefer relative assets folder': '优先使用相对资源目录',
  'Relative image folder name': '相对图片目录名称',
  'Spell Checking': '拼写检查',
  'Enable spell checking': '启用拼写检查',
  'Hide spelling underlines': '隐藏拼写下划线',
  'Default spellcheck language': '默认拼写检查语言',
  'English (US)': '英语（美国）',
  'English (UK)': '英语（英国）',
  German: '德语',
  French: '法语',
  'Browse…': '浏览…',
  Clear: '清除',
  'Requires restart to fully apply.': '需要重启后才能完全生效。',
  On: '开',
  Off: '关',
  'Loading settings…': '正在加载设置…',
  'Not Yet Included': '暂未纳入',
  'Key bindings and custom spell-check dictionary editing are still outside this panel.': '快捷键和自定义拼写词典编辑暂未纳入此面板。',
  Files: '文件',
  File: '文件',
  Search: '搜索',
  Outline: '大纲',
  New: '新建',
  Open: '打开',
  Folder: '文件夹',
  'OPEN TABS': '打开的标签',
  'No open tabs': '没有打开的标签',
  WORKSPACE: '工作区',
  'No folder opened': '未打开文件夹',
  RECENT: '最近',
  'No recent files': '没有最近文件',
  SEARCH: '搜索',
  'Search in document': '在文档中搜索',
  Replacement: '替换内容',
  Replace: '替换',
  'Replace All': '全部替换',
  'Case Sensitive': '区分大小写',
  'Whole Word': '全字匹配',
  'Regular Expression': '正则表达式',
  'Invalid regular expression.': '无效的正则表达式。',
  'RegExp matches an empty string.': '正则表达式会匹配空字符串。',
  Prev: '上一个',
  Next: '下一个',
  'TABLE OF CONTENTS': '目录',
  'No headers': '没有标题',
  'Recent Files': '最近文件',
  'Open Markdown': '打开 Markdown',
  'New File': '新建文件',
  'Open Example': '打开示例',
  Save: '保存',
  'Save As': '另存为',
  DevTools: '开发者工具'
}

const METRIC_SHORT_LABELS: Record<RendererLocale, Record<'word' | 'paragraph' | 'character' | 'all', string>> = {
  en: {
    word: 'W',
    paragraph: 'P',
    character: 'C',
    all: 'A'
  },
  'zh-CN': {
    word: '词',
    paragraph: '段',
    character: '字',
    all: '全'
  }
}

export const normalizeLocale = (value: string | null | undefined): RendererLocale => {
  if (!value) {
    return 'en'
  }

  const normalized = value.toLowerCase()
  if (normalized === 'zh-cn' || normalized === 'zh' || normalized.startsWith('zh-')) {
    return 'zh-CN'
  }

  return 'en'
}

export const translateMessage = (locale: string | null | undefined, message: string) => {
  const normalizedLocale = normalizeLocale(locale)
  if (normalizedLocale === 'en') {
    return message
  }

  return ZH_CN_MESSAGES[message] ?? message
}

export const translateMetricShort = (
  locale: string | null | undefined,
  metric: 'word' | 'paragraph' | 'character' | 'all'
) => {
  return METRIC_SHORT_LABELS[normalizeLocale(locale)][metric]
}
