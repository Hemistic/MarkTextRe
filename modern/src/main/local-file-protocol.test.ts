import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  resolveLocalFileRequestPath,
  resolveLocalFileRequestUrl
} from './local-file-protocol'

describe('resolveLocalFileRequestUrl', () => {
  it('restores Windows drive-letter file URLs from the custom protocol', () => {
    expect(resolveLocalFileRequestUrl('marktext-file://c/Users/41448/Pictures/demo.png')).toBe(
      'file:///C:/Users/41448/Pictures/demo.png'
    )
  })

  it('keeps canonical local custom URLs valid', () => {
    expect(resolveLocalFileRequestUrl('marktext-file:///C:/Users/41448/Pictures/demo.png')).toBe(
      'file:///C:/Users/41448/Pictures/demo.png'
    )
  })

  it('restores unix-like file URLs from the custom protocol', () => {
    expect(resolveLocalFileRequestUrl('marktext-file:///home/tester/demo.png')).toBe(
      'file:///home/tester/demo.png'
    )
  })

  it('restores a Windows file path that Electron serializes with a drive-letter host', () => {
    expect(resolveLocalFileRequestPath('marktext-file://c/Users/41448/Pictures/demo.png')).toBe(
      path.win32.normalize('C:/Users/41448/Pictures/demo.png')
    )
  })
})
