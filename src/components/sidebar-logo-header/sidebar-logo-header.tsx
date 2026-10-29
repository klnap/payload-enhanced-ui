import type { ReactNode } from 'react'

type SidebarLogoHeaderProps = {
  children: ReactNode
}

/** Wraps the admin nav logo — separated from scrollable links (`peui-sidebar-logo-header`). */
export function SidebarLogoHeader({ children }: SidebarLogoHeaderProps) {
  return (
    <div className='peui-sidebar-logo-header relative shrink-0 bg-[var(--theme-bg)] pt-4 pb-8'>
      {children}
    </div>
  )
}
