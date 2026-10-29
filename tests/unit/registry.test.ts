import { describe, expect, test } from 'bun:test'

import { FEATURE_REGISTRY } from '#enh-ui/features/registry'
import type { AdminFeatureKey, EnhancedUiFeatureId } from '#enh-ui/features/types'
import { resolveFeatures } from '#enh-ui/plugin/resolve-features'

const ADMIN_KEYS: AdminFeatureKey[] = [
  'localeSwitcher',
  'scrollbarStyling',
  'headerSpacing',
  'breadcrumbs',
  'sidebarNavStyling',
  'sidebarLogo',
  'fieldGroupTitles',
  'collectionListTableScroll',
  'dateTimePickerStyling',
  'livePreviewLayout',
]

describe('FEATURE_REGISTRY', () => {
  test('registry has 11 features', () => {
    expect(FEATURE_REGISTRY.length).toBe(11)
  })

  test('every admin key has a registry entry and default resolve', () => {
    const ids = new Set(FEATURE_REGISTRY.map((f) => f.id))
    for (const key of ADMIN_KEYS) {
      const id = `admin.${key}` as EnhancedUiFeatureId
      expect(ids.has(id)).toBe(true)
    }
    const resolved = resolveFeatures({})
    expect(resolved.byId['fields.checkboxUseSwitch']).toBe(true)
    for (const key of ADMIN_KEYS) {
      expect(resolved.byId[`admin.${key}` as EnhancedUiFeatureId]).toBe(true)
    }
  })

  test('enhancedUi() with no config enables all admin features and fields', () => {
    const resolved = resolveFeatures()
    for (const key of ADMIN_KEYS) {
      expect(resolved.byId[`admin.${key}` as EnhancedUiFeatureId]).toBe(true)
    }
    expect(resolved.byId['fields.checkboxUseSwitch']).toBe(true)
  })
})
