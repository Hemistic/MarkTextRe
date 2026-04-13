import { describe, expect, it } from 'vitest'
import type { ProjectTreeNode } from '@shared/contracts'
import { sortProjectTree } from './projectTreeSortSupport'

const createFile = (
  name: string,
  createdAtMs: number,
  modifiedAtMs: number
): ProjectTreeNode => ({
  id: name,
  pathname: `D:/docs/${name}`,
  name,
  isDirectory: false,
  isFile: true,
  isMarkdown: true,
  createdAtMs,
  modifiedAtMs
})

describe('projectTreeSortSupport', () => {
  it('sorts files by title while preserving the same root object', () => {
    const root: ProjectTreeNode = {
      id: 'root',
      pathname: 'D:/docs',
      name: 'docs',
      isDirectory: true,
      isFile: false,
      isMarkdown: false,
      folders: [],
      files: [
        createFile('zeta.md', 1, 1),
        createFile('Alpha.md', 3, 3),
        createFile('beta.md', 2, 2)
      ]
    }

    const sorted = sortProjectTree(root, 'title')

    expect(sorted).toBe(root)
    expect(root.files?.map(file => file.name)).toEqual(['Alpha.md', 'beta.md', 'zeta.md'])
  })

  it('sorts files by modified time descending and recurses into child folders', () => {
    const nestedFolder: ProjectTreeNode = {
      id: 'nested',
      pathname: 'D:/docs/nested',
      name: 'nested',
      isDirectory: true,
      isFile: false,
      isMarkdown: false,
      files: [
        createFile('later.md', 1, 20),
        createFile('earlier.md', 2, 10)
      ],
      folders: []
    }

    const root: ProjectTreeNode = {
      id: 'root',
      pathname: 'D:/docs',
      name: 'docs',
      isDirectory: true,
      isFile: false,
      isMarkdown: false,
      folders: [
        {
          id: 'z-folder',
          pathname: 'D:/docs/z-folder',
          name: 'z-folder',
          isDirectory: true,
          isFile: false,
          isMarkdown: false,
          folders: [],
          files: []
        },
        nestedFolder,
        {
          id: 'a-folder',
          pathname: 'D:/docs/a-folder',
          name: 'a-folder',
          isDirectory: true,
          isFile: false,
          isMarkdown: false,
          folders: [],
          files: []
        }
      ],
      files: [
        createFile('old.md', 1, 10),
        createFile('new.md', 2, 30)
      ]
    }

    sortProjectTree(root, 'modified')

    expect(root.folders?.map(folder => folder.name)).toEqual(['a-folder', 'nested', 'z-folder'])
    expect(root.files?.map(file => file.name)).toEqual(['new.md', 'old.md'])
    expect(nestedFolder.files?.map(file => file.name)).toEqual(['later.md', 'earlier.md'])
  })

  it('sorts files by creation time descending when requested', () => {
    const root: ProjectTreeNode = {
      id: 'root',
      pathname: 'D:/docs',
      name: 'docs',
      isDirectory: true,
      isFile: false,
      isMarkdown: false,
      folders: [],
      files: [
        createFile('middle.md', 10, 2),
        createFile('latest.md', 30, 1),
        createFile('first.md', 1, 3)
      ]
    }

    sortProjectTree(root, 'created')

    expect(root.files?.map(file => file.name)).toEqual(['latest.md', 'middle.md', 'first.md'])
  })
})
