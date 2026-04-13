import { expect, it, describe } from 'vitest'
import type { MuyaEditorInstance } from './types'
import {
  MUYA_PLUGIN_SLOTS,
  ensureMuyaPluginSlots,
  unwrapMuyaConstructorExport
} from './bridgeHelpers'

describe('unwrapMuyaConstructorExport', () => {
  it('returns the first function found while unwrapping default exports', () => {
    class FakeConstructor {}

    const exported = {
      default: {
        default: FakeConstructor
      }
    }

    expect(unwrapMuyaConstructorExport(exported)).toBe(FakeConstructor)
  })

  it('stops unwrapping when default points to itself or is missing', () => {
    const selfReferencing = { default: undefined }
    expect(unwrapMuyaConstructorExport(selfReferencing)).toBe(selfReferencing)

    const direct = { default: () => {} }
    expect(unwrapMuyaConstructorExport(direct)).toBe(direct.default)
  })
})

describe('ensureMuyaPluginSlots', () => {
  it('creates destroyable placeholders for every plugin slot', () => {
    const editor = {} as unknown as MuyaEditorInstance
    const updated = ensureMuyaPluginSlots(editor)

    for (const slot of MUYA_PLUGIN_SLOTS) {
      const value = updated[slot] as { destroy?: () => void }
      expect(value).toBeDefined()
      expect(typeof value.destroy).toBe('function')
    }
  })

  it('does not override slots that already exist', () => {
    const placeholder = { destroy: () => {} }
    const editor = {
      quickInsert: placeholder
    } as unknown as MuyaEditorInstance
    const updated = ensureMuyaPluginSlots(editor)
    expect(updated.quickInsert).toBe(placeholder)
  })
})
