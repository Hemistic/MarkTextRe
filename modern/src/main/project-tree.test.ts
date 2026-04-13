import path from 'node:path'
import os from 'node:os'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { afterEach, describe, expect, it } from 'vitest'
import { buildProjectTree } from './project-tree'

describe('project-tree', () => {
  const tempDirectories: string[] = []

  afterEach(async () => {
    await Promise.all(tempDirectories.splice(0).map(directory => rm(directory, { force: true, recursive: true })))
  })

  it('builds project tree nodes with filesystem timestamps', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'marktext-project-tree-'))
    tempDirectories.push(baseDir)

    const workspaceRoot = path.join(baseDir, 'workspace')
    const docsFolder = path.join(workspaceRoot, 'docs')
    const notePath = path.join(workspaceRoot, 'note.md')

    await mkdir(docsFolder, { recursive: true })
    await writeFile(notePath, '# Note')

    const tree = await buildProjectTree(workspaceRoot)
    const fileNode = tree.files?.find(file => file.pathname === notePath)
    const folderNode = tree.folders?.find(folder => folder.pathname === docsFolder)

    expect(tree.createdAtMs).toEqual(expect.any(Number))
    expect(tree.modifiedAtMs).toEqual(expect.any(Number))
    expect(fileNode?.createdAtMs).toEqual(expect.any(Number))
    expect(fileNode?.modifiedAtMs).toEqual(expect.any(Number))
    expect(folderNode?.createdAtMs).toEqual(expect.any(Number))
    expect(folderNode?.modifiedAtMs).toEqual(expect.any(Number))
  })
})
