import type { AdminFeatureKey, EnhancedUiFeature } from '#enh-ui/features/types'

/** Admin feature that only ships `styles.css` (no config mutation). */
export function defineAdminCssFeature(key: AdminFeatureKey): EnhancedUiFeature {
  const id = `admin.${key}` as const
  return {
    id,
    category: 'admin',
    isEnabled: (resolved) => resolved.byId[id],
    apply: ({ incoming }) => incoming,
  }
}
