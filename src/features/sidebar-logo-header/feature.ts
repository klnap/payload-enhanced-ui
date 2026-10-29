import type { Config } from 'payload'
import type { EnhancedUiFeature } from '#enh-ui/features/types'
import { ADMIN_NAV_LOGO } from '#enh-ui/integration/import-map-paths'

function applySidebarLogoHeader(incoming: Config): Config {
  const admin = incoming.admin ?? {}
  const components = admin.components ?? {}
  const beforeNav = [...(components.beforeNav ?? [])]
  if (!beforeNav.includes(ADMIN_NAV_LOGO)) {
    beforeNav.unshift(ADMIN_NAV_LOGO)
  }

  return {
    ...incoming,
    admin: {
      ...admin,
      components: {
        ...components,
        beforeNav,
      },
    },
  }
}

/** @see ./styles.css */
export const sidebarLogoFeature: EnhancedUiFeature = {
  id: 'admin.sidebarLogo',
  category: 'admin',
  isEnabled: (resolved) => resolved.byId['admin.sidebarLogo'],
  apply: ({ incoming }) => applySidebarLogoHeader(incoming),
}
