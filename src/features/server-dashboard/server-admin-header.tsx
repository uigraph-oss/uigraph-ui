'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trackGTag } from '@/helpers/track'
import { signOut, useAuthStore } from '@/store/auth-store'
import { LayoutGrid, LogOut } from 'lucide-react'
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

      <ServerUserMenu />
    </header>
  )
}

function ServerUserMenu() {
  const user = useAuthStore((state) => state.user)

  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage
            src={user?.avatarUrl || ''}
            alt="Profile"
            className="object-cover"
          />
          <AvatarFallback className="bg-paragraph/30 text-foreground/70 gap-1 font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="border-stock bg-shading min-w-[14.375rem] p-0"
      >
        <div className="border-stock border-b px-4">
          <DropdownMenuLabel className="flex flex-col justify-center gap-2 px-0 py-3 leading-[1.33]">
            <h4 className="font-semibold">{user?.name}</h4>
            <p className="text-sm">{user?.email}</p>
          </DropdownMenuLabel>
        </div>

        <div className="border-stock space-y-2 border-b px-2.5 py-2">
          <DropdownMenuItem
            asChild
            className="h-[2.4375rem] cursor-pointer transition-all hover:bg-[#f5f5f5]"
          >
            <Link to="/dashboard">
              <LayoutGrid className="text-base" />
              Back to app
            </Link>
          </DropdownMenuItem>
        </div>

        <div className="px-2.5 py-2">
          <DropdownMenuItem
            onClick={async () => {
              trackGTag('logout')
              await signOut()
              window.location.href = '/sign-in'
            }}
            className="hover:text-destructive! h-[2.4375rem] cursor-pointer transition-all hover:bg-red-100!"
          >
            <LogOut className="text-base" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
