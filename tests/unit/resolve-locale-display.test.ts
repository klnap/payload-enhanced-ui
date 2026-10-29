import { describe, expect, test } from 'bun:test'
import type { I18nClient } from '@payloadcms/translations'
import type { Locale } from 'payload'

import {
  resolveLocaleDisplay,
  resolveServerLocaleProps,
} from '#enh-ui/components/locale-switcher/resolve-locale-display'

const i18n = { language: 'en', translations: {} } as I18nClient

const localization = {
  defaultLocale: 'en',
  locales: [
    { label: 'English', code: 'en' },
    { label: 'Polski', code: 'pl' },
  ],
}

describe('resolveLocaleDisplay', () => {
  test('prefers hook locale when code is set', () => {
    const hookLocale = { code: 'pl', label: 'Polski' } as Locale
    expect(
      resolveLocaleDisplay({
        hookLocale,
        i18n,
        localization,
        serverLocaleCode: 'en',
        serverLocaleLabel: 'English',
      })
    ).toEqual({ code: 'pl', label: 'Polski' })
  })

  test('uses server label when hook has code but empty label (hydration)', () => {
    expect(
      resolveLocaleDisplay({
        hookLocale: { code: 'pl', label: '' } as Locale,
        i18n,
        localization,
        serverLocaleCode: 'pl',
        serverLocaleLabel: 'Polski',
      })
    ).toEqual({ code: 'pl', label: 'Polski' })
  })

  test('prefers server label when locale codes match (hydration)', () => {
    expect(
      resolveLocaleDisplay({
        hookLocale: { code: 'pl', label: 'Polish' } as Locale,
        i18n,
        localization,
        serverLocaleCode: 'pl',
        serverLocaleLabel: 'Polski',
      })
    ).toEqual({ code: 'pl', label: 'Polski' })
  })

  test('falls back to server props when hook locale is empty', () => {
    expect(
      resolveLocaleDisplay({
        hookLocale: {} as Locale,
        i18n,
        localization,
        serverLocaleCode: 'pl',
        serverLocaleLabel: 'Polski',
      })
    ).toEqual({ code: 'pl', label: 'Polski' })
  })

  test('falls back to search param when hook and server props missing', () => {
    expect(
      resolveLocaleDisplay({
        hookLocale: {} as Locale,
        i18n,
        localization,
        searchParamsLocale: 'pl',
      })
    ).toEqual({ code: 'pl', label: 'Polski' })
  })
})

describe('resolveServerLocaleProps', () => {
  test('searchParams.locale wins over locale prop', () => {
    expect(
      resolveServerLocaleProps({
        i18n,
        localization,
        locale: { code: 'en', label: 'English' } as Locale,
        searchParams: { locale: 'pl' },
      })
    ).toEqual({ serverLocaleCode: 'pl', serverLocaleLabel: 'Polski' })
  })
})
