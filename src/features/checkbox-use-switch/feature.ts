import { applyCheckboxFieldsUseSwitch } from '#enh-ui/features/checkbox-use-switch/map-checkbox-fields'
import type { EnhancedUiFeature } from '#enh-ui/features/types'

export const checkboxUseSwitchFeature: EnhancedUiFeature = {
  id: 'fields.checkboxUseSwitch',
  category: 'fields',
  isEnabled: (resolved) => resolved.byId['fields.checkboxUseSwitch'],
  apply: ({ incoming }) => {
    const collections = (incoming.collections ?? []).map((collection) => ({
      ...collection,
      fields: applyCheckboxFieldsUseSwitch(collection.fields),
    }))
    const globals = (incoming.globals ?? []).map((global) => ({
      ...global,
      fields: applyCheckboxFieldsUseSwitch(global.fields),
    }))

    return {
      ...incoming,
      collections,
      globals,
    }
  },
}
