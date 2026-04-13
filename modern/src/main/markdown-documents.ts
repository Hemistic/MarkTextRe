import path from 'node:path'
import { promises as fs } from 'node:fs'
import { createRequire } from 'node:module'
import type {
  EditorDocument,
  MarkdownEncoding,
  ResolvedLineEnding,
  SaveDocumentInput,
  SaveDocumentResult
} from '@shared/contracts'
import { updateRecentDocuments } from './recent-documents'
import { readSettingsState } from './settings-storage'

const require = createRequire(import.meta.url)
const iconv = require('iconv-lite') as typeof import('iconv-lite')

const UTF8_BOM = Buffer.from([0xEF, 0xBB, 0xBF])
const UTF16BE_BOM = Buffer.from([0xFE, 0xFF])
const UTF16LE_BOM = Buffer.from([0xFF, 0xFE])
const LINE_ENDING_REGEXP = /\r\n|\n/g

const createDocument = (
  pathname: string,
  markdown: string,
  options: Pick<EditorDocument, 'encoding' | 'lineEnding' | 'adjustLineEndingOnSave' | 'trimTrailingNewline' | 'isMixedLineEndings'>
): EditorDocument => ({
  id: pathname,
  pathname,
  filename: path.basename(pathname),
  markdown,
  dirty: false,
  ...options
})

const hasBom = (buffer: Buffer, bom: Buffer) => buffer.subarray(0, bom.length).equals(bom)

const isValidUtf8 = (buffer: Buffer) => {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    return true
  } catch {
    return false
  }
}

const detectEncoding = (
  buffer: Buffer,
  preferredEncoding: string,
  autoGuessEncoding: boolean
): MarkdownEncoding => {
  if (hasBom(buffer, UTF8_BOM)) {
    return { encoding: 'utf8', isBom: true }
  }

  if (hasBom(buffer, UTF16BE_BOM)) {
    return { encoding: 'utf16be', isBom: true }
  }

  if (hasBom(buffer, UTF16LE_BOM)) {
    return { encoding: 'utf16le', isBom: true }
  }

  if (autoGuessEncoding && isValidUtf8(buffer)) {
    return { encoding: 'utf8', isBom: false }
  }

  return {
    encoding: iconv.encodingExists(preferredEncoding) ? preferredEncoding : 'utf8',
    isBom: false
  }
}

const getResolvedLineEnding = (markdown: string, preferredLineEnding: ResolvedLineEnding): {
  adjustLineEndingOnSave: boolean
  isMixedLineEndings: boolean
  lineEnding: ResolvedLineEnding
  markdown: string
} => {
  const endings = Array.from(markdown.matchAll(LINE_ENDING_REGEXP), match => match[0])
  const hasLf = endings.includes('\n')
  const hasCrlf = endings.includes('\r\n')
  const isMixedLineEndings = hasLf && hasCrlf
  const isUnknownEnding = endings.length === 0

  let lineEnding: ResolvedLineEnding = preferredLineEnding
  if (hasCrlf && !hasLf) {
    lineEnding = 'crlf'
  } else if (hasLf && !hasCrlf) {
    lineEnding = 'lf'
  }

  return {
    adjustLineEndingOnSave: isMixedLineEndings || isUnknownEnding || lineEnding !== 'lf',
    isMixedLineEndings,
    lineEnding,
    markdown: markdown.replace(/\r\n/g, '\n')
  }
}

const resolveTrimTrailingNewline = (markdown: string, requestedMode: number) => {
  if (requestedMode !== 2) {
    return requestedMode
  }

  if (!markdown) {
    return 3
  }

  const lastIndex = markdown.length - 1
  if (lastIndex >= 1 && markdown[lastIndex] === '\n' && markdown[lastIndex - 1] === '\n') {
    return 2
  }
  if (markdown[lastIndex] === '\n') {
    return 1
  }

  return 0
}

const trimTrailingNewlines = (markdown: string) => markdown.replace(/[\r?\n]+$/, '')

const adjustTrailingNewlines = (markdown: string, mode: number) => {
  if (!markdown) {
    return ''
  }

  switch (mode) {
    case 0:
      return trimTrailingNewlines(markdown)
    case 1: {
      const trimmed = trimTrailingNewlines(markdown)
      return trimmed ? `${trimmed}\n` : ''
    }
    default:
      return markdown
  }
}

const convertLineEndings = (markdown: string, lineEnding: ResolvedLineEnding) => {
  return markdown.replace(/\r\n|\n/g, lineEnding === 'crlf' ? '\r\n' : '\n')
}

const resolvePreferredLineEnding = async (): Promise<ResolvedLineEnding> => {
  const settings = await readSettingsState()
  if (settings.endOfLine === 'crlf') {
    return 'crlf'
  }

  if (settings.endOfLine === 'lf') {
    return 'lf'
  }

  return process.platform === 'win32' ? 'crlf' : 'lf'
}

export const openMarkdownDocument = async (pathname: string) => {
  const settings = await readSettingsState()
  const buffer = await fs.readFile(pathname)
  const encoding = detectEncoding(buffer, settings.defaultEncoding, settings.autoGuessEncoding)
  const decoded = iconv.decode(buffer, encoding.encoding)
  const preferredLineEnding = settings.endOfLine === 'default'
    ? (process.platform === 'win32' ? 'crlf' : 'lf')
    : settings.endOfLine
  const lineEndingState = getResolvedLineEnding(decoded, preferredLineEnding)
  const trimTrailingNewline = resolveTrimTrailingNewline(
    lineEndingState.markdown,
    settings.trimTrailingNewline
  ) as SaveDocumentResult['trimTrailingNewline']
  await updateRecentDocuments(pathname)
  return createDocument(pathname, lineEndingState.markdown, {
    encoding,
    lineEnding: lineEndingState.lineEnding,
    adjustLineEndingOnSave: lineEndingState.adjustLineEndingOnSave,
    trimTrailingNewline,
    isMixedLineEndings: lineEndingState.isMixedLineEndings
  })
}

export const tryOpenMarkdownDocument = async (pathname: string) => {
  try {
    return await openMarkdownDocument(pathname)
  } catch {
    return null
  }
}

export const saveMarkdownDocument = async (
  pathname: string,
  input: SaveDocumentInput
): Promise<SaveDocumentResult> => {
  const settings = await readSettingsState()
  const encoding = input.encoding && iconv.encodingExists(input.encoding.encoding)
    ? input.encoding
    : {
        encoding: settings.defaultEncoding,
        isBom: false
      }
  const lineEnding = input.lineEnding ?? await resolvePreferredLineEnding()
  const trimTrailingNewline = input.trimTrailingNewline ?? settings.trimTrailingNewline
  const adjustLineEndingOnSave = input.adjustLineEndingOnSave ?? (lineEnding !== 'lf')

  let markdown = adjustTrailingNewlines(input.markdown, trimTrailingNewline)
  if (adjustLineEndingOnSave) {
    markdown = convertLineEndings(markdown, lineEnding)
  }

  const buffer = iconv.encode(markdown, encoding.encoding, { addBOM: encoding.isBom })
  await fs.writeFile(pathname, buffer)
  await updateRecentDocuments(pathname)

  return {
    pathname,
    filename: path.basename(pathname),
    encoding,
    lineEnding,
    adjustLineEndingOnSave,
    trimTrailingNewline,
    isMixedLineEndings: false
  }
}
