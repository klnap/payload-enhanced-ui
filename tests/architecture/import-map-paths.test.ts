import { describe, expect, test } from 'bun:test'

import { ENHANCED_UI_STYLES, LOCALE_SWITCHER_ACTION } from '#enh-ui/integration/import-map-paths'

describe('import-map-paths', () => {
  test('locale switcher uses rsc# for SSR; style loader stays client#', () => {
    expect(LOCALE_SWITCHER_ACTION).toMatch(/\/rsc#/)
    expect(ENHANCED_UI_STYLES).toMatch(/\/client#/)
  })

  test('style loader and locale switcher use distinct import-map paths', () => {
    expect(LOCALE_SWITCHER_ACTION).toBe('@klnap/payload-enhanced-ui/rsc#LocaleSwitcher')
    expect(ENHANCED_UI_STYLES).toBe('@klnap/payload-enhanced-ui/client#EnhancedUiStyleLoader')
  })
})
