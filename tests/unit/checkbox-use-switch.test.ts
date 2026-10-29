import { describe, expect, it } from 'bun:test'
import type { Config, Field } from 'payload'

import { CHECKBOX_SWITCH_FIELD } from '#enh-ui/integration/import-map-paths'
import { enhancedUi } from '#enh-ui/plugin/enhanced-ui-plugin'

function fieldComponentPath(field: Field): string | undefined {
  const admin = field.admin
  if (!admin || typeof admin !== 'object' || !('components' in admin)) return undefined
  const components = admin.components
  if (!components || typeof components !== 'object' || !('Field' in components)) {
    return undefined
  }
  const fieldComp = components.Field
  return typeof fieldComp === 'string' ? fieldComp : undefined
}

function applyFieldsOnly(incoming: Config): Config {
  const out = enhancedUi({
    admin: false,
    fields: { checkboxUseSwitch: true },
  })(incoming)
  if (out instanceof Promise) throw new Error('expected sync plugin')
  return out
}

describe('fields.checkboxUseSwitch', () => {
  it('does not mutate incoming config', () => {
    const incoming = {
      collections: [
        {
          slug: 'posts',
          fields: [{ type: 'checkbox', name: 'featured' } as Field],
        },
      ],
    } as Config
    const snapshot = JSON.parse(JSON.stringify(incoming)) as Config
    const out = applyFieldsOnly(incoming)
    expect(out).not.toBe(incoming)
    expect(incoming).toEqual(snapshot)
  })

  it('sets switch Field on checkbox fields', () => {
    const incoming = {
      collections: [
        {
          slug: 'posts',
          fields: [
            { type: 'text', name: 'title' } as Field,
            { type: 'checkbox', name: 'featured' } as Field,
          ],
        },
      ],
    } as Config

    const out = applyFieldsOnly(incoming)
    const fields = out.collections?.[0]?.fields ?? []
    expect(fieldComponentPath(fields[0]!)).toBeUndefined()
    expect(fieldComponentPath(fields[1]!)).toBe(CHECKBOX_SWITCH_FIELD)
  })
})
