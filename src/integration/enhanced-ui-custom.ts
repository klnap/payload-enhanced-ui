import {
  CIRCLE_FLAGS_DEFAULT_BASE_URL,
  type ResolvedCircleFlags,
} from '#enh-ui/components/locale-switcher/circle-flags'
import type { EnhancedUiConfig, FeatureToggle, LocaleSwitcherOptions } from '#enh-ui/features/types'
import { CUSTOM_ENHANCED_UI_KEY } from '#enh-ui/integration/import-map-paths'

export type EnhancedUiCustom = {
  resolved?: Record<string, boolean>
  localeSwitcher?: {
    circleFlags: ResolvedCircleFlags
  }
}

function isFeatureOn(
  value: FeatureToggle | LocaleSwitcherOptions | undefined,
  defaultOn: boolean
): boolean {
  if (value === undefined) return defaultOn
  if (value === false) return false
  if (value === true) return true
  if (value.enabled === false) return false
  return true
}

function isLocaleSwitcherOptions(
  value: FeatureToggle | LocaleSwitcherOptions
): value is LocaleSwitcherOptions {
  return typeof value === 'object' && value !== null && 'circleFlags' in value
}

function resolveCircleFlags(
  localeSwitcher: FeatureToggle | LocaleSwitcherOptions | undefined
): ResolvedCircleFlags {
  const disabled =
    localeSwitcher === false ||
    (localeSwitcher !== undefined &&
      localeSwitcher !== true &&
      isLocaleSwitcherOptions(localeSwitcher) &&
      localeSwitcher.circleFlags === false)

  if (disabled) {
    return { enabled: false, baseUrl: CIRCLE_FLAGS_DEFAULT_BASE_URL, flagCodeByLocale: {} }
  }

  const raw =
    localeSwitcher !== undefined &&
    localeSwitcher !== true &&
    isLocaleSwitcherOptions(localeSwitcher) &&
    localeSwitcher.circleFlags &&
    typeof localeSwitcher.circleFlags === 'object'
      ? localeSwitcher.circleFlags
      : {}

  return {
    enabled: raw.enabled !== false,
    baseUrl: raw.baseUrl ?? CIRCLE_FLAGS_DEFAULT_BASE_URL,
    flagCodeByLocale: raw.flagCodeByLocale ?? {},
  }
}

export function resolveEnhancedUiCustom(userConfig: EnhancedUiConfig = {}): EnhancedUiCustom {
  const adminOff = userConfig.admin === false
  const localeSwitcherRaw =
    userConfig.admin === false ? undefined : userConfig.admin?.localeSwitcher

  const localeSwitcherOn = !adminOff && isFeatureOn(localeSwitcherRaw, true)

  return {
    localeSwitcher: localeSwitcherOn
      ? { circleFlags: resolveCircleFlags(localeSwitcherRaw) }
      : undefined,
  }
}

export function readEnhancedUiCustom(config: {
  custom?: Record<string, unknown>
}): EnhancedUiCustom {
  const raw = config.custom?.[CUSTOM_ENHANCED_UI_KEY]
  if (!raw || typeof raw !== 'object') {
    return {
      localeSwitcher: {
        circleFlags: {
          enabled: true,
          baseUrl: CIRCLE_FLAGS_DEFAULT_BASE_URL,
          flagCodeByLocale: {},
        },
      },
    }
  }
  return raw as EnhancedUiCustom
}
