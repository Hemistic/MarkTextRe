import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  LocalImageProcessInput,
  SettingsState
} from '@shared/contracts'
import { readSettingsState } from './settings-storage'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'])

const isChildOfDirectory = (directoryPath: string, targetPath: string) => {
  const relativePath = path.relative(directoryPath, targetPath)
  return Boolean(relativePath) && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
}

const normalizeMarkdownPath = (pathname: string) => {
  return process.platform === 'win32' ? pathname.replace(/\\/g, '/') : pathname
}

const replaceFilenameToken = (value: string, documentPathname?: string | null) => {
  const filename = documentPathname
    ? path.basename(documentPathname).replace(/\.[^/.]+$/, '')
    : ''

  return value.replace(/\$\{filename\}/g, filename)
}

const toLocalFilePath = (sourcePath: string) => {
  if (!/^file:\/\//i.test(sourcePath)) {
    return sourcePath
  }

  try {
    return fileURLToPath(sourcePath)
  } catch {
    return sourcePath
  }
}

const resolveSourceImagePath = (
  sourcePath: string,
  documentPathname?: string | null
) => {
  const localPath = toLocalFilePath(sourcePath)

  if (path.isAbsolute(localPath)) {
    return path.normalize(localPath)
  }

  if (!documentPathname) {
    return path.normalize(localPath)
  }

  return path.resolve(path.dirname(documentPathname), localPath)
}

const isImageFile = async (pathname: string) => {
  try {
    const stat = await fs.stat(pathname)
    return stat.isFile() && IMAGE_EXTENSIONS.has(path.extname(pathname).toLowerCase())
  } catch {
    return false
  }
}

const hashFileContent = async (pathname: string) => {
  const content = await fs.readFile(pathname)
  return createHash('sha1').update(content).digest('hex')
}

const copyImageToFolder = async (sourcePath: string, outputDirectory: string) => {
  await fs.mkdir(outputDirectory, { recursive: true })

  const targetPath = path.join(outputDirectory, path.basename(sourcePath))
  if (path.resolve(sourcePath) === path.resolve(targetPath)) {
    return targetPath
  }

  const hash = await hashFileContent(sourcePath)
  const hashedTargetPath = path.join(outputDirectory, `${hash}${path.extname(sourcePath)}`)

  await fs.copyFile(sourcePath, hashedTargetPath)
  return hashedTargetPath
}

const moveImageToRelativeFolder = async (
  cwd: string,
  relativeDirectoryName: string,
  documentPathname: string,
  imagePath: string
) => {
  const nextRelativeDirectoryName = relativeDirectoryName || 'assets'
  if (path.isAbsolute(nextRelativeDirectoryName)) {
    throw new Error('Invalid relative directory name.')
  }

  const targetDirectory = path.resolve(cwd, nextRelativeDirectoryName)
  const targetPath = path.join(targetDirectory, path.basename(imagePath))

  await fs.mkdir(targetDirectory, { recursive: true })
  if (path.resolve(imagePath) !== path.resolve(targetPath)) {
    await fs.copyFile(imagePath, targetPath)
    await fs.unlink(imagePath).catch(() => {})
  }

  return normalizeMarkdownPath(path.relative(path.dirname(documentPathname), targetPath))
}

export const processLocalImageWithSettings = async (
  input: LocalImageProcessInput,
  settings: SettingsState
) => {
  const resolvedSourcePath = resolveSourceImagePath(input.sourcePath, input.documentPathname)
  const imageExists = await isImageFile(resolvedSourcePath)
  if (!imageExists) {
    return input.sourcePath
  }

  if (settings.imageInsertAction === 'path') {
    return resolvedSourcePath
  }

  const documentPathname = input.documentPathname ?? null
  const workspaceRootPath = input.workspaceRootPath ?? null
  const imageFolderPath = replaceFilenameToken(settings.imageFolderPath, documentPathname)
  const copiedPath = await copyImageToFolder(resolvedSourcePath, imageFolderPath)

  if (!documentPathname || !settings.imagePreferRelativeDirectory) {
    return copiedPath
  }

  const relativeDirectoryName = replaceFilenameToken(settings.imageRelativeDirectoryName, documentPathname)
  const saveRelativeToFile = /\$\{filename\}/.test(settings.imageRelativeDirectoryName)
  let relativeBasePath = path.dirname(documentPathname)

  if (!saveRelativeToFile && workspaceRootPath && isChildOfDirectory(workspaceRootPath, documentPathname)) {
    relativeBasePath = workspaceRootPath
  }

  return moveImageToRelativeFolder(
    relativeBasePath,
    relativeDirectoryName,
    documentPathname,
    copiedPath
  )
}

export const processLocalImage = async (
  input: LocalImageProcessInput
) => {
  const settings = await readSettingsState()
  return processLocalImageWithSettings(input, settings)
}
