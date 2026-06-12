'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { DASHBOARD_SETTINGS_NAV_LINKS } from '@/constants'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import { PropsWithChildren, ReactNode, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DashboardHeader } from './dashboard-header'
import { DashboardSidebar } from './dashboard-sidebar'

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <main className="bg-shading-gray grid h-screen grid-cols-[5.25rem_1fr] gap-2">
      <DashboardSidebar />
      {children}
    </main>
  )
}

export function DashboardSettingsLayout({ children }: PropsWithChildren) {
  const { pathname } = useLocation()
  const { isAdmin } = usePermissions()

  const crumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const crumbs = [{ to: '/settings', label: 'Settings' }]

    let path = ''
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      path += `/${segment}`
      const matched = DASHBOARD_SETTINGS_NAV_LINKS.find(
        (link) => link.id === path
      )

      if (matched) {
        crumbs.push({ to: matched.id, label: matched.label })
      }
    }

    return crumbs
  }, [pathname])

  return (
    <DashboardPageLayout crumbs={crumbs}>
      <div className="grid h-full grid-cols-[15rem_1fr] gap-3 p-3">
        <aside className="border-stock block rounded-[0.75rem] border bg-white">
          <label className="border-stock flex h-14 items-center border-b px-4">
            Settings
          </label>

          <ul className="flex flex-col gap-2 px-4 py-2">
            {DASHBOARD_SETTINGS_NAV_LINKS.filter(
              (item) => !item.adminOnly || isAdmin
            ).map((item) => {
              const isActive = item.isActive(pathname)

              return (
                <li key={item.id} className="block *:transition-all">
                  <Link
                    to={item.id}
                    className={cn(
                      'flex h-[2.4375rem] items-center rounded-[0.5rem] bg-transparent px-3 py-2',
                      isActive
                        ? 'text-primary bg-primary/5'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <span className={'block text-base'}>{item.icon}</span>
                    <span className={'ml-2 block text-sm'}>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>

        <GridScrollBody
          className={'border-stock rounded-[0.75rem] border bg-white'}
        >
          {children}
        </GridScrollBody>
      </div>
    </DashboardPageLayout>
  )
}

export function DashboardPageLayout({
  children,
  crumbs,
}: PropsWithChildren<{ crumbs: { to: string; label: ReactNode }[] }>) {
  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-4 pr-6">
      <DashboardHeader crumbs={crumbs} />

      <GridScrollBody className="bg-shading rounded-t-[1.2rem]">
        {children}
      </GridScrollBody>
    </div>
  )
}
