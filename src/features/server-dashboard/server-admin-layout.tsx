'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { SERVER_NAV_LINKS } from '@/constants'
import { DashboardSidebar } from '@/features/dashboard/dashboard-sidebar'
import { cn } from '@/lib/utils'
import { PropsWithChildren, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ServerAdminHeader } from './server-admin-header'

export function ServerAdminLayout({ children }: PropsWithChildren) {
  const { pathname } = useLocation()

  const crumbs = useMemo(() => {
    const base = [{ to: '/server', label: 'Server' }]
    const matched = SERVER_NAV_LINKS.find((link) => link.isActive(pathname))
    if (matched) {
      base.push({ to: matched.id, label: matched.label })
    }
    return base
  }, [pathname])

  return (
    <main className="bg-shading-gray grid h-screen grid-cols-[5.25rem_1fr] gap-2">
      <DashboardSidebar />

      <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-4 pr-6">
        <ServerAdminHeader crumbs={crumbs} />

        <GridScrollBody className="bg-shading rounded-t-[1.2rem]">
          <div className="grid h-full grid-cols-[15rem_1fr] gap-3 p-3">
            <aside className="border-stock bg-card block rounded-[0.75rem] border">
              <label className="border-stock flex h-14 items-center border-b px-4">
                Server Admin
              </label>

              <ul className="flex flex-col gap-2 px-4 py-2">
                {SERVER_NAV_LINKS.map((item) => {
                  const isActive = item.isActive(pathname)

                  return (
                    <li key={item.id} className="block *:transition-all">
                      <Link
                        to={item.id}
                        className={cn(
                          'flex h-[2.4375rem] items-center rounded-[0.5rem] bg-transparent px-3 py-2',
                          isActive
                            ? 'text-primary bg-primary/10'
                            : 'hover:bg-white/[0.06]'
                        )}
                      >
                        <span className={'block text-base'}>{item.icon}</span>
                        <span className={'ml-2 block text-sm'}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </aside>

            <GridScrollBody
              className={'border-stock bg-card rounded-[0.75rem] border'}
            >
              {children}
            </GridScrollBody>
          </div>
        </GridScrollBody>
      </div>
    </main>
  )
}
