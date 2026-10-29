/** @see https://github.com/HatScripts/circle-flags */
export const CIRCLE_FLAGS_DEFAULT_BASE_URL = 'https://hatscripts.github.io/circle-flags'

/** Payload locale code → ISO 3166-1 alpha-2 (circle-flags file name). */
const LOCALE_TO_FLAG: Record<string, string> = {
  en: 'gb',
  'en-gb': 'gb',
  'en-us': 'us',
  pt: 'pt',
  'pt-br': 'br',
  zh: 'cn',
  'zh-cn': 'cn',
  'zh-tw': 'tw',
  ja: 'jp',
  ko: 'kr',
  ar: 'sa',
  he: 'il',
  uk: 'ua',
  el: 'gr',
  da: 'dk',
  sv: 'se',
  nb: 'no',
  nn: 'no',
  cs: 'cz',
  sl: 'si',
}

export type ResolvedCircleFlags = {
  enabled: boolean
  baseUrl: string
  flagCodeByLocale: Record<string, string>
}

export function resolveCircleFlagCode(
  localeCode: string,
  flagCodeByLocale: Record<string, string> = {}
): string {
  const raw = localeCode.trim().toLowerCase()
  if (!raw) return 'xx'

  if (flagCodeByLocale[raw]) return flagCodeByLocale[raw].toLowerCase()
  if (flagCodeByLocale[localeCode]) return flagCodeByLocale[localeCode].toLowerCase()

  const parts = raw.split('-')
  const region = parts[1]
  if (parts.length === 2 && region && region.length === 2) {
    const regionKey = `${parts[0]}-${region}`
    if (flagCodeByLocale[regionKey]) return flagCodeByLocale[regionKey].toLowerCase()
    const mappedRegion = LOCALE_TO_FLAG[regionKey]
    if (mappedRegion) return mappedRegion
    return region
  }

  if (LOCALE_TO_FLAG[raw]) return LOCALE_TO_FLAG[raw]
  if (/^[a-z]{2}$/.test(raw)) return raw

  return raw.slice(0, 2)
}

export function circleFlagUrl(
  localeCode: string,
  options: Pick<ResolvedCircleFlags, 'baseUrl' | 'flagCodeByLocale'>
): string {
  const flag = resolveCircleFlagCode(localeCode, options.flagCodeByLocale)
  const base = options.baseUrl.replace(/\/$/, '')
  return `${base}/flags/${flag}.svg`
}
