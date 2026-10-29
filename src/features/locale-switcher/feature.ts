import type { Config } from 'payload'
import type { EnhancedUiFeature } from '#enh-ui/features/types'
import { LOCALE_SWITCHER_ACTION } from '#enh-ui/integration/import-map-paths'

function applyLocaleSwitcher(incoming: Config): Config {
  if (!incoming.localization) return incoming

  const admin = incoming.admin ?? {}
  const components = admin.components ?? {}
  const actions = [...(components.actions ?? [])].filter(
    (action) => action !== LOCALE_SWITCHER_ACTION
  )
  actions.push(LOCALE_SWITCHER_ACTION)

  return {
    ...incoming,
    admin: {
      ...admin,
      components: {
        ...components,
        actions,
      },
    },
  }
}

/** @see ./styles.css */
export const localeSwitcherFeature: EnhancedUiFeature = {
  id: 'admin.localeSwitcher',
  category: 'admin',
  isEnabled: (resolved) => resolved.byId['admin.localeSwitcher'],
  apply: ({ incoming }) => applyLocaleSwitcher(incoming),
}
