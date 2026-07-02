'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { UserDropdownMenu } from '@/features/dashboard/dashboard-header'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'

export type ServerAdminHeaderProps = {
  crumbs: { to: string; label: React.ReactNode }[]
}

export function ServerAdminHeader({ crumbs }: ServerAdminHeaderProps) {
  return (
    <header className="bg-shading flex h-[5rem] items-center justify-between rounded-[1.2rem] px-6 py-4">
      <Breadcrumb>
        <BreadcrumbList className="gap-2 text-[1.375rem]">
          {crumbs.map((crumb, i, all) => (
            <Fragment key={`${crumb.to}-${i}`}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {all.length - 1 === i ? (
                  <BreadcrumbPage className="font-semibold">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="font-semibold" asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <UserDropdownMenu />
    </header>
  )
}
