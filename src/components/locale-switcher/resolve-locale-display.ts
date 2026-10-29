import type { I18nClient } from '@payloadcms/translations'
import { getTranslation } from '@payloadcms/translations'
import type { Locale } from 'payload'

export type LocalizationConfig = {
  defaultLocale: string
  locales: Locale[]
}

export type LocaleDisplay = {
  code: string
  label: string
}

function localeCodeFromParams(
  searchParamsLocale: string | string[] | undefined
): string | undefined {
  if (typeof searchParamsLocale === 'string') return searchParamsLocale
  if (Array.isArray(searchParamsLocale) && searchParamsLocale[0]) {
    return searchParamsLocale[0]
  }
  return undefined
}

function findLocaleOption(
  localization: LocalizationConfig,
  code: string | undefined
): Locale | undefined {
  if (!code) return undefined
  return localization.locales.find((entry) => entry.code === code)
}

function labelForLocale(localeOption: Locale | undefined, i18n: I18nClient): string {
  if (!localeOption) return ''
  return getTranslation(localeOption.label, i18n)
}

/** Resolve document locale code + label for header display (SSR + client fallback). */
export function resolveLocaleDisplay(args: {
  hookLocale: Locale
  i18n: I18nClient
  localization: LocalizationConfig | false | null | undefined
  searchParamsLocale?: string | string[] | undefined
  serverLocaleCode?: string
  serverLocaleLabel?: string
}): LocaleDisplay | null {
  const {
    hookLocale,
    i18n,
    localization,
    searchParamsLocale,
    serverLocaleCode,
    serverLocaleLabel,
  } = args

  if (!localization || localization.locales.length === 0) {
    return null
  }

  if (hookLocale?.code) {
    const option = findLocaleOption(localization, hookLocale.code)
    const fromHook = getTranslation(hookLocale.label, i18n) || labelForLocale(option, i18n) || ''
    // Keep SSR and the first client paint aligned — admin i18n can differ from hook labels.
    const label =
      serverLocaleCode === hookLocale.code && serverLocaleLabel
        ? serverLocaleLabel
        : fromHook || hookLocale.code
    return {
      code: hookLocale.code,
      label,
    }
  }

  if (serverLocaleCode) {
    const option = findLocaleOption(localization, serverLocaleCode)
    return {
      code: serverLocaleCode,
      label: serverLocaleLabel || labelForLocale(option, i18n) || serverLocaleCode,
    }
  }

  const paramCode = localeCodeFromParams(searchParamsLocale)
  const code = paramCode || localization.defaultLocale || localization.locales[0]?.code

  if (!code) return null

  const option = findLocaleOption(localization, code)
  const label = labelForLocale(option, i18n) || code
  return { code, label }
}

/** Server-side: derive props for the client switcher from Payload request data. */
export function resolveServerLocaleProps(args: {
  i18n: I18nClient
  localization: LocalizationConfig
  locale?: Locale
  searchParams?: Record<string, string | string[] | undefined>
}): { serverLocaleCode: string; serverLocaleLabel: string } {
  const paramCode = localeCodeFromParams(args.searchParams?.locale)
  const code =
    paramCode ||
    args.locale?.code ||
    args.localization.defaultLocale ||
    args.localization.locales[0]?.code ||
    ''

  const option = findLocaleOption(args.localization, code)
  const label =
    (args.locale?.code === code && args.locale.label
      ? getTranslation(args.locale.label, args.i18n)
      : '') ||
    labelForLocale(option, args.i18n) ||
    code

  return { serverLocaleCode: code, serverLocaleLabel: label }
}
