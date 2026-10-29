import { describe, expect, test } from 'bun:test'
import type { Config } from 'payload'

import {
  ADMIN_NAV_LOGO,
  CHECKBOX_SWITCH_FIELD,
  ENHANCED_UI_STYLES,
  LOCALE_SWITCHER_ACTION,
} from '#enh-ui/integration/import-map-paths'
import { enhancedUi } from '#enh-ui/plugin/enhanced-ui-plugin'

function compose(config?: Parameters<typeof enhancedUi>[0]): Config {
  const plugin = enhancedUi(config)
  const incoming = {
    localization: { locales: [{ label: 'English', code: 'en' }] },
    collections: [{ slug: 'posts', fields: [{ type: 'checkbox', name: 'featured' }] }],
  } as Config
  const result = plugin(incoming)
  if (result instanceof Promise) {
    throw new Error('expected sync plugin')
  }
  return result
}

describe('enhancedUi plugin composition', () => {
  test('enabled: false is a no-op', () => {
    const incoming = { collections: [] } as unknown as Config
    const out = enhancedUi({ enabled: false })(incoming)
    expect(out).toBe(incoming)
  })

  test('default install registers shell, locale, brand logo, and checkbox field', () => {
    const out = compose()
    expect(out.admin?.components?.afterNav).toContain(ENHANCED_UI_STYLES)
    expect(out.admin?.components?.beforeNav).toContain(ADMIN_NAV_LOGO)
    expect(out.admin?.components?.actions).toContain(LOCALE_SWITCHER_ACTION)
    const field = out.collections?.[0]?.fields?.[0]
    expect(field?.admin?.components?.Field).toBe(CHECKBOX_SWITCH_FIELD)
    expect(out.custom?.enhancedUi).toBeDefined()
  })

  test('admin: false disables admin features but keeps fields', () => {
    const out = compose({ admin: false, fields: { checkboxUseSwitch: true } })
    expect(out.admin?.components?.actions ?? []).not.toContain(LOCALE_SWITCHER_ACTION)
    expect(out.admin?.components?.afterNav ?? []).not.toContain(ENHANCED_UI_STYLES)
    expect(out.admin?.components?.beforeNav ?? []).not.toContain(ADMIN_NAV_LOGO)
    const field = out.collections?.[0]?.fields?.[0]
    expect(field?.admin?.components?.Field).toBe(CHECKBOX_SWITCH_FIELD)
    expect(out.custom?.enhancedUi?.resolved?.['admin.localeSwitcher']).toBe(false)
  })

  test('fields: false disables checkbox mapping', () => {
    const out = compose({ fields: false })
    const field = out.collections?.[0]?.fields?.[0]
    expect(field?.admin?.components?.Field).toBeUndefined()
  })

  test('all admin style flags off omits style loader', () => {
    const out = compose({
      admin: {
        localeSwitcher: false,
        scrollbarStyling: false,
        headerSpacing: false,
        breadcrumbs: false,
        sidebarNavStyling: false,
        sidebarLogo: false,
        fieldGroupTitles: false,
        collectionListTableScroll: false,
        dateTimePickerStyling: false,
        livePreviewLayout: false,
      },
      fields: false,
    })
    expect(out.admin?.components?.afterNav ?? []).not.toContain(ENHANCED_UI_STYLES)
  })
})
