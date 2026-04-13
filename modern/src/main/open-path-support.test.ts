import { describe, expect, it, vi } from 'vitest'
import {
  enqueueUniquePath,
  extractOpenablePaths,
  isMarkdownPath,
  normalizeOpenablePath
} from './open-path-support'

describe('open path support', () => {
  it('only enqueues unique paths', () => {
    const queue = ['a.md']
    enqueueUniquePath(queue, 'a.md')
    enqueueUniquePath(queue, 'b.md')

    expect(queue).toEqual(['a.md', 'b.md'])
  })

  it('detects supported markdown extensions', () => {
    expect(isMarkdownPath('notes.md')).toBe(true)
    expect(isMarkdownPath('notes.MARKDOWN')).toBe(true)
    expect(isMarkdownPath('notes.pdf')).toBe(false)
  })

  it('normalizes only existing markdown files', async () => {
    const statPath = vi.fn(async () => ({
      isFile: () => true
    }))

    await expect(normalizeOpenablePath('README.md', {
      pathResolver: candidate => `/repo/${candidate}`,
      statPath
    })).resolves.toBe('/repo/README.md')

    await expect(normalizeOpenablePath('--flag', {
      pathResolver: candidate => candidate,
      statPath
    })).resolves.toBeNull()

    await expect(normalizeOpenablePath('README.pdf', {
      pathResolver: candidate => candidate,
      statPath
    })).resolves.toBeNull()
  })

  it('filters argv to openable markdown paths', async () => {
    const statPath = vi.fn(async (pathname: string) => ({
      isFile: () => pathname !== '/repo/dir.md'
    }))

    await expect(extractOpenablePaths(
      ['README.md', 'README.pdf', '--flag', 'dir.md'],
      {
        pathResolver: candidate => `/repo/${candidate}`,
        statPath
      }
    )).resolves.toEqual(['/repo/README.md'])
  })
})
