import { getTranslation } from '@payloadcms/translations'
import type { ServerProps } from 'payload'

import LocaleSwitcherClient, { type LocaleSwitcherClientProps } from './locale-switcher'
import { type LocalizationConfig, resolveServerLocaleProps } from './resolve-locale-display'

type Props = Pick<ServerProps, 'i18n' | 'locale' | 'payload' | 'searchParams' | 'user'>

export default function LocaleSwitcher({ i18n, locale, payload, searchParams, user }: Props) {
  if (!user) return null

  const raw = payload.config.localization
  if (raw === false || !raw.locales?.length) {
    return null
  }

  const localization = raw as LocalizationConfig
  const { serverLocaleCode, serverLocaleLabel } = resolveServerLocaleProps({
    i18n,
    locale,
    localization,
    searchParams,
  })

  const localeOptions: LocaleSwitcherClientProps['localeOptions'] = localization.locales.map(
    (entry) => ({
      code: entry.code,
      label: getTranslation(entry.label, i18n) || entry.code,
    })
  )

  return (
    <LocaleSwitcherClient
      defaultLocale={localization.defaultLocale}
      localeOptions={localeOptions}
      serverLocaleCode={serverLocaleCode}
      serverLocaleLabel={serverLocaleLabel}
    />
  )
}
