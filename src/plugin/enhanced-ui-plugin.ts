import type { Config, Plugin } from 'payload'

import { FEATURE_REGISTRY } from '#enh-ui/features/registry'
import type { EnhancedUiConfig, ResolvedFeatures } from '#enh-ui/features/types'
import { resolveEnhancedUiCustom } from '#enh-ui/integration/enhanced-ui-custom'
import { CUSTOM_ENHANCED_UI_KEY, ENHANCED_UI_STYLES } from '#enh-ui/integration/import-map-paths'

import { needsStyleLoader, resolveFeatures } from '#enh-ui/plugin/resolve-features'

function stampCustom(
  incoming: Config,
  resolved: ResolvedFeatures,
  userConfig: EnhancedUiConfig
): Config {
  const enhancedUiCustom = resolveEnhancedUiCustom(userConfig)
  const custom = {
    ...incoming.custom,
    [CUSTOM_ENHANCED_UI_KEY]: {
      resolved: resolved.byId,
      ...enhancedUiCustom,
    },
  }
  return { ...incoming, custom }
}

function ensureStyleLoader(incoming: Config, resolved: ResolvedFeatures): Config {
  if (!needsStyleLoader(resolved)) return incoming

  const admin = incoming.admin ?? {}
  const components = admin.components ?? {}
  const afterNav = [...(components.afterNav ?? [])]
  if (!afterNav.includes(ENHANCED_UI_STYLES)) {
    afterNav.unshift(ENHANCED_UI_STYLES)
  }

  return {
    ...incoming,
    admin: {
      ...admin,
      components: {
        ...components,
        afterNav,
      },
    },
  }
}

export function enhancedUi(userConfig: EnhancedUiConfig = {}): Plugin {
  return (incoming: Config): Config => {
    if (userConfig.enabled === false) return incoming

    const resolved = resolveFeatures(userConfig)
    const reduced = FEATURE_REGISTRY.reduce(
      (cfg, feature) =>
        feature.isEnabled(resolved) ? feature.apply({ incoming: cfg, resolved }) : cfg,
      incoming
    )

    return ensureStyleLoader(stampCustom(reduced, resolved, userConfig), resolved)
  }
}
