import type {
  SettingsPathPickerKind,
  SettingsState
} from '@shared/contracts'

type SettingsKey = keyof SettingsState

export interface SettingsOption<T extends string | number = string | number> {
  label: string
  value: T
}

interface BaseFieldDescriptor<K extends SettingsKey = SettingsKey> {
  key: K
  label: string
  description?: string
  disabled?: boolean
  restartRequired?: boolean
}

export interface ToggleFieldDescriptor<K extends SettingsKey = SettingsKey> extends BaseFieldDescriptor<K> {
  kind: 'toggle'
}

export interface SelectFieldDescriptor<K extends SettingsKey = SettingsKey> extends BaseFieldDescriptor<K> {
  kind: 'select'
  options: SettingsOption[]
}

export interface RangeFieldDescriptor<K extends SettingsKey = SettingsKey> extends BaseFieldDescriptor<K> {
  kind: 'range'
  min: number
  max: number
  step: number
  unit?: string
}

export interface TextFieldDescriptor<K extends SettingsKey = SettingsKey> extends BaseFieldDescriptor<K> {
  kind: 'text'
  placeholder?: string
}

export interface PathFieldDescriptor<K extends SettingsKey = SettingsKey> extends BaseFieldDescriptor<K> {
  kind: 'path'
  pickerKind: SettingsPathPickerKind
  placeholder?: string
}

export type SettingsFieldDescriptor =
  | ToggleFieldDescriptor
  | SelectFieldDescriptor
  | RangeFieldDescriptor
  | TextFieldDescriptor
  | PathFieldDescriptor

export interface SettingsSectionDescriptor {
  title: string
  fields: SettingsFieldDescriptor[]
}

export interface SettingsCategoryDescriptor {
  id: string
  label: string
  sections: SettingsSectionDescriptor[]
}

const titleBarStyleOptions: SettingsOption[] = [
  { label: 'Custom', value: 'custom' },
  { label: 'Native', value: 'native' }
]

const zoomOptions: SettingsOption<number>[] = [
  { label: '50.0%', value: 0.5 },
  { label: '62.5%', value: 0.625 },
  { label: '75.0%', value: 0.75 },
  { label: '87.5%', value: 0.875 },
  { label: '100.0%', value: 1.0 },
  { label: '112.5%', value: 1.125 },
  { label: '125.0%', value: 1.25 },
  { label: '137.5%', value: 1.375 },
  { label: '150.0%', value: 1.5 },
  { label: '162.5%', value: 1.625 },
  { label: '175.0%', value: 1.75 },
  { label: '187.5%', value: 1.875 },
  { label: '200.0%', value: 2.0 }
]

const fileSortByOptions: SettingsOption[] = [
  { label: 'Creation time', value: 'created' },
  { label: 'Modification time', value: 'modified' },
  { label: 'Title', value: 'title' }
]

const languageOptions: SettingsOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Chinese (Simplified)', value: 'zh-CN' }
]

const startupActionOptions: SettingsOption[] = [
  { label: 'Open default folder', value: 'folder' },
  { label: 'Restore last session', value: 'lastState' },
  { label: 'Open blank page', value: 'blank' }
]

const tabSizeOptions: SettingsOption<number>[] = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 }
]

const endOfLineOptions: SettingsOption[] = [
  { label: 'Default', value: 'default' },
  { label: 'CRLF', value: 'crlf' },
  { label: 'LF', value: 'lf' }
]

const trimTrailingNewlineOptions: SettingsOption<number>[] = [
  { label: 'Trim all trailing', value: 0 },
  { label: 'Ensure exactly one trailing', value: 1 },
  { label: 'Preserve original style', value: 2 },
  { label: 'Do nothing', value: 3 }
]

const textDirectionOptions: SettingsOption[] = [
  { label: 'Left to Right', value: 'ltr' },
  { label: 'Right to Left', value: 'rtl' }
]

const defaultEncodingOptions: SettingsOption[] = [
  'ascii', 'utf8', 'utf16be', 'utf16le', 'utf32be', 'utf32le', 'latin3', 'iso885915', 'cp1252',
  'arabic', 'cp1256', 'latin4', 'cp1257', 'iso88592', 'windows1250', 'cp866', 'iso88595',
  'koi8r', 'koi8u', 'cp1251', 'iso885913', 'greek', 'cp1253', 'hebrew', 'cp1255', 'latin5',
  'cp1254', 'gb2312', 'gb18030', 'gbk', 'big5', 'big5hkscs', 'shiftjis', 'eucjp', 'euckr', 'latin6'
].map(value => ({ label: value, value }))

const bulletListMarkerOptions: SettingsOption[] = [
  { label: '*', value: '*' },
  { label: '-', value: '-' },
  { label: '+', value: '+' }
]

const orderListDelimiterOptions: SettingsOption[] = [
  { label: '.', value: '.' },
  { label: ')', value: ')' }
]

const preferHeadingStyleOptions: SettingsOption[] = [
  { label: 'ATX heading', value: 'atx' },
  { label: 'Setext heading', value: 'setext' }
]

const listIndentationOptions: SettingsOption[] = [
  { label: 'DocFX style', value: 'dfm' },
  { label: 'True tab character', value: 'tab' },
  { label: 'Single space', value: 1 },
  { label: 'Two spaces', value: 2 },
  { label: 'Three spaces', value: 3 },
  { label: 'Four spaces', value: 4 }
]

const frontmatterTypeOptions: SettingsOption[] = [
  { label: 'YAML', value: '-' },
  { label: 'TOML', value: '+' },
  { label: 'JSON (;;;)', value: ';' },
  { label: 'JSON ({})', value: '{' }
]

const sequenceThemeOptions: SettingsOption[] = [
  { label: 'Hand drawn', value: 'hand' },
  { label: 'Simple', value: 'simple' }
]

const themeOptions: SettingsOption[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Graphite', value: 'graphite' },
  { label: 'Material Dark', value: 'material-dark' },
  { label: 'Ulysses', value: 'ulysses' },
  { label: 'One Dark', value: 'one-dark' }
]

const autoSwitchThemeOptions: SettingsOption<number>[] = [
  { label: 'Adjust at startup', value: 0 },
  { label: 'Only at runtime', value: 1 },
  { label: 'Never', value: 2 }
]

const imageInsertActionOptions: SettingsOption[] = [
  { label: 'Copy to global or relative folder', value: 'folder' },
  { label: 'Keep original location', value: 'path' }
]

const spellcheckerLanguageOptions: SettingsOption[] = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'German', value: 'de-DE' },
  { label: 'French', value: 'fr-FR' },
  { label: 'Chinese (Simplified)', value: 'zh-CN' }
]

export const settingsCategories: SettingsCategoryDescriptor[] = [
  {
    id: 'general',
    label: 'General',
    sections: [
      {
        title: 'Auto Save',
        fields: [
          { kind: 'toggle', key: 'autoSave', label: 'Automatically save document changes' },
          {
            kind: 'range',
            key: 'autoSaveDelay',
            label: 'Save delay',
            min: 1000,
            max: 10000,
            step: 100,
            unit: 'ms'
          }
        ]
      },
      {
        title: 'Window',
        fields: [
          {
            kind: 'select',
            key: 'titleBarStyle',
            label: 'Title bar style',
            options: titleBarStyleOptions,
            restartRequired: true
          },
          { kind: 'toggle', key: 'hideScrollbar', label: 'Hide scrollbars' },
          { kind: 'toggle', key: 'tabBarVisibility', label: 'Show tab bar' },
          {
            kind: 'toggle',
            key: 'openFilesInNewWindow',
            label: 'Open files in new window'
          },
          {
            kind: 'toggle',
            key: 'openFolderInNewWindow',
            label: 'Open folders in new window'
          },
          { kind: 'select', key: 'zoom', label: 'Zoom', options: zoomOptions }
        ]
      },
      {
        title: 'Sidebar',
        fields: [
          { kind: 'toggle', key: 'sideBarVisibility', label: 'Show sidebar panel' },
          { kind: 'toggle', key: 'wordWrapInToc', label: 'Wrap text in table of contents' },
          {
            kind: 'select',
            key: 'fileSortBy',
            label: 'Sort files by',
            options: fileSortByOptions
          }
        ]
      },
      {
        title: 'Startup',
        fields: [
          {
            kind: 'select',
            key: 'startUpAction',
            label: 'Startup action',
            options: startupActionOptions,
            description: 'Choose whether to restore the last session, open a default folder, or start blank.'
          },
          {
            kind: 'path',
            key: 'defaultDirectoryToOpen',
            label: 'Default directory to open',
            pickerKind: 'default-directory',
            placeholder: 'Select a folder',
            description: 'Used when startup action is set to open a default folder.'
          }
        ]
      },
      {
        title: 'Misc',
        fields: [
          {
            kind: 'select',
            key: 'language',
            label: 'Interface language',
            options: languageOptions
          }
        ]
      }
    ]
  },
  {
    id: 'editor',
    label: 'Editor',
    sections: [
      {
        title: 'Text Editor',
        fields: [
          { kind: 'range', key: 'fontSize', label: 'Font size', min: 12, max: 32, step: 1, unit: 'px' },
          { kind: 'range', key: 'lineHeight', label: 'Line height', min: 1.2, max: 2, step: 0.1 },
          { kind: 'text', key: 'editorFontFamily', label: 'Font family' },
          {
            kind: 'text',
            key: 'editorLineWidth',
            label: 'Maximum editor width',
            description: 'Leave empty for theme default, or use values like 72ch, 900px, or 80%.'
          }
        ]
      },
      {
        title: 'Code Blocks',
        fields: [
          { kind: 'range', key: 'codeFontSize', label: 'Font size', min: 12, max: 28, step: 1, unit: 'px' },
          { kind: 'text', key: 'codeFontFamily', label: 'Font family' },
          {
            kind: 'toggle',
            key: 'trimUnnecessaryCodeBlockEmptyLines',
            label: 'Remove leading and trailing empty lines'
          }
        ]
      },
      {
        title: 'Writing Behavior',
        fields: [
          { kind: 'toggle', key: 'autoPairBracket', label: 'Automatically close brackets' },
          { kind: 'toggle', key: 'autoPairMarkdownSyntax', label: 'Automatically complete Markdown syntax' },
          { kind: 'toggle', key: 'autoPairQuote', label: 'Automatically close quotation marks' }
        ]
      },
      {
        title: 'File Representation',
        fields: [
          { kind: 'select', key: 'tabSize', label: 'Preferred tab width', options: tabSizeOptions },
          {
            kind: 'select',
            key: 'endOfLine',
            label: 'Line separator',
            options: endOfLineOptions
          },
          {
            kind: 'select',
            key: 'defaultEncoding',
            label: 'Default encoding',
            options: defaultEncodingOptions
          },
          {
            kind: 'toggle',
            key: 'autoGuessEncoding',
            label: 'Automatically detect file encoding'
          },
          {
            kind: 'select',
            key: 'trimTrailingNewline',
            label: 'Trailing newline handling',
            options: trimTrailingNewlineOptions
          }
        ]
      },
      {
        title: 'Misc',
        fields: [
          { kind: 'select', key: 'textDirection', label: 'Text direction', options: textDirectionOptions },
          { kind: 'toggle', key: 'hideQuickInsertHint', label: 'Hide quick insert hint' },
          { kind: 'toggle', key: 'hideLinkPopup', label: 'Hide link popup on hover' },
          { kind: 'toggle', key: 'autoCheck', label: 'Automatically check related tasks' }
        ]
      }
    ]
  },
  {
    id: 'markdown',
    label: 'Markdown',
    sections: [
      {
        title: 'Lists',
        fields: [
          { kind: 'toggle', key: 'preferLooseListItem', label: 'Prefer loose list items' },
          { kind: 'select', key: 'bulletListMarker', label: 'Bullet list marker', options: bulletListMarkerOptions },
          {
            kind: 'select',
            key: 'orderListDelimiter',
            label: 'Ordered list delimiter',
            options: orderListDelimiterOptions
          },
          { kind: 'select', key: 'listIndentation', label: 'List indentation', options: listIndentationOptions }
        ]
      },
      {
        title: 'Extensions',
        fields: [
          { kind: 'select', key: 'frontmatterType', label: 'Front matter format', options: frontmatterTypeOptions },
          { kind: 'toggle', key: 'superSubScript', label: 'Enable superscript and subscript' },
          { kind: 'toggle', key: 'footnote', label: 'Enable footnotes', restartRequired: true }
        ]
      },
      {
        title: 'Compatibility',
        fields: [
          { kind: 'toggle', key: 'isHtmlEnabled', label: 'Enable HTML rendering' },
          { kind: 'toggle', key: 'isGitlabCompatibilityEnabled', label: 'Enable GitLab compatibility mode' }
        ]
      },
      {
        title: 'Diagrams',
        fields: [
          { kind: 'select', key: 'sequenceTheme', label: 'Sequence diagram theme', options: sequenceThemeOptions }
        ]
      },
      {
        title: 'Misc',
        fields: [
          {
            kind: 'select',
            key: 'preferHeadingStyle',
            label: 'Preferred heading style',
            options: preferHeadingStyleOptions,
            disabled: true
          }
        ]
      }
    ]
  },
  {
    id: 'theme',
    label: 'Theme',
    sections: [
      {
        title: 'Appearance',
        fields: [
          { kind: 'select', key: 'theme', label: 'Theme', options: themeOptions },
          {
            kind: 'select',
            key: 'autoSwitchTheme',
            label: 'Auto switch theme',
            options: autoSwitchThemeOptions
          }
        ]
      }
    ]
  },
  {
    id: 'image',
    label: 'Image',
    sections: [
      {
        title: 'Insert Behavior',
        fields: [
          {
            kind: 'select',
            key: 'imageInsertAction',
            label: 'Default action after inserting a local image',
            options: imageInsertActionOptions
          }
        ]
      },
      {
        title: 'Folders',
        fields: [
          {
            kind: 'path',
            key: 'imageFolderPath',
            label: 'Global image folder',
            pickerKind: 'image-folder',
            placeholder: 'Select a folder'
          },
          {
            kind: 'toggle',
            key: 'imagePreferRelativeDirectory',
            label: 'Prefer relative assets folder'
          },
          {
            kind: 'text',
            key: 'imageRelativeDirectoryName',
            label: 'Relative image folder name'
          }
        ]
      }
    ]
  },
  {
    id: 'spelling',
    label: 'Spelling',
    sections: [
      {
        title: 'Spell Checking',
        fields: [
          { kind: 'toggle', key: 'spellcheckerEnabled', label: 'Enable spell checking' },
          { kind: 'toggle', key: 'spellcheckerNoUnderline', label: 'Hide spelling underlines' },
          {
            kind: 'select',
            key: 'spellcheckerLanguage',
            label: 'Default spellcheck language',
            options: spellcheckerLanguageOptions
          }
        ]
      }
    ]
  }
]

export const getSettingsCategory = (categoryId: string) => {
  return settingsCategories.find(category => category.id === categoryId) ?? settingsCategories[0]
}
