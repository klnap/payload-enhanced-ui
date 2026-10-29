import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import type { ServerProps } from 'payload'

import { SidebarLogoHeader } from '#enh-ui/components/sidebar-logo-header/sidebar-logo-header'

type AdminNavLogoProps = Pick<
  ServerProps,
  'i18n' | 'locale' | 'params' | 'payload' | 'permissions' | 'searchParams' | 'user'
>

/** Sidebar brand: host `admin.components.graphics.Logo` inside `peui-sidebar-logo-header`. */
export default function AdminNavLogo(props: AdminNavLogoProps) {
  const { payload } = props
  const CustomLogo = payload.config.admin?.components?.graphics?.Logo

  return (
    <SidebarLogoHeader>
      {RenderServerComponent({
        Component: CustomLogo,
        importMap: payload.importMap,
        clientProps: { variant: 'nav' },
        serverProps: props,
      })}
    </SidebarLogoHeader>
  )
}
