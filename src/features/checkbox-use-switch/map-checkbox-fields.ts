import type { Field } from 'payload'

import { CHECKBOX_SWITCH_FIELD } from '#enh-ui/integration/import-map-paths'

export function mapFields(fields: Field[], map: (field: Field) => Field): Field[] {
  return fields.map((field) => {
    if (field.type === 'tabs' && 'tabs' in field) {
      return {
        ...field,
        tabs: field.tabs.map((tab) => ({
          ...tab,
          fields: mapFields(tab.fields, map),
        })),
      }
    }

    if (
      (field.type === 'group' ||
        field.type === 'array' ||
        field.type === 'row' ||
        field.type === 'collapsible') &&
      'fields' in field &&
      Array.isArray(field.fields)
    ) {
      return {
        ...field,
        fields: mapFields(field.fields, map),
      }
    }

    if (field.type === 'blocks' && 'blocks' in field) {
      return {
        ...field,
        blocks: field.blocks.map((block) => ({
          ...block,
          fields: mapFields(block.fields, map),
        })),
      }
    }

    return map(field)
  })
}

function toSwitch(field: Field): Field {
  if (field.type !== 'checkbox') return field

  const prevAdmin = field.admin ? { ...field.admin } : {}
  const prevComponents = prevAdmin.components ? { ...prevAdmin.components } : {}

  if ('Field' in prevComponents && prevComponents.Field) return field

  return {
    ...field,
    admin: {
      ...prevAdmin,
      components: {
        ...prevComponents,
        Field: CHECKBOX_SWITCH_FIELD,
      },
    },
  }
}

export function applyCheckboxFieldsUseSwitch(fields: Field[]): Field[] {
  return mapFields(fields, toSwitch)
}
