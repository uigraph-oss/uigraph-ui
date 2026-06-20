'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { SERVER_NAV_LINKS } from '@/constants'
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
    <main className="bg-shading-gray grid h-screen grid-rows-[auto_1fr] gap-[0.81rem] px-6 pt-4">
      <ServerAdminHeader crumbs={crumbs} />

      <div className="grid h-full min-h-0 grid-cols-[15rem_1fr] gap-3 pb-3">
        <aside className="border-stock block rounded-[0.75rem] border bg-white">
          <label className="border-stock flex h-14 items-center px-4 font-semibold">
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
                        ? 'text-primary bg-primary/5'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <span className="block text-base">{item.icon}</span>
                    <span className="ml-2 block text-sm">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>

        <GridScrollBody className="border-stock rounded-[0.75rem] border bg-white">
          {children}
        </GridScrollBody>
      </div>
    </main>
  )
}
