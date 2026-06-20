'use client'

import { UiGraphLogo } from '@/components/logo'
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
import { Shield } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { LogoutIcon } from './assets/icons'

export type DashboardHeaderProps = {
  enableLogo?: boolean
  crumbs: { to: string; label: React.ReactNode }[]
}

export function DashboardHeader({ crumbs, enableLogo }: DashboardHeaderProps) {
  return (
    <header className="bg-shading flex h-[5rem] items-center justify-between rounded-[1.2rem] px-6 py-4">
      <div className="flex items-center gap-6">
        {enableLogo && (
          <Link to="/dashboard/maps" className="rounded-full bg-white">
            <UiGraphLogo />
          </Link>
        )}

        <Breadcrumb>
          <BreadcrumbList className={'gap-2 text-[1.375rem]'}>
            {crumbs.map((crumb, i, crumbs) => (
              <Fragment key={`${crumb.to}-${i}`}>
                {i > 0 && <BreadcrumbSeparator />}

                <BreadcrumbItem>
                  {crumbs.length - 1 === i ? (
                    <BreadcrumbPage className={'font-semibold'}>
                      {capitalizeBreadcrumbLabel(crumb.label)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink className={'font-semibold'} asChild>
                      <Link to={crumb.to}>
                        {capitalizeBreadcrumbLabel(crumb.label)}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center space-x-4">
        {/* <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <GridIcon className="text-xl" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <NotificationQuickIcon className="text-xl" />
        </Button> */}

        <UserDropdownMenu />
      </div>
    </header>
  )
}

export function UserDropdownMenu() {
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
            <h4 className={'font-semibold'}>{user?.name}</h4>
            <p className={'text-sm'}>{user?.email}</p>
          </DropdownMenuLabel>
        </div>

        {/* <div className="border-stock space-y-2 border-b px-4 py-2">
          <DropdownMenuItem
            asChild
            className="h-[2.4375rem] cursor-pointer transition-all hover:bg-[#f5f5f5]"
            onClick={() => console.log('Profile')}
          >
            <Link href="/settings/profile">
              <UserIcon className="text-base" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="h-[2.4375rem] cursor-pointer transition-all hover:bg-[#f5f5f5]"
            onClick={() => console.log('Profile')}
          >
            <Link href="/settings/team">
              <UsersIcon className="text-base" />
              Team management
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="h-[2.4375rem] cursor-pointer transition-all hover:bg-[#f5f5f5]"
            onClick={() => console.log('Profile')}
          >
            <Link href="/settings/account">
              <SettingsIcon className="text-base" />
              Settings
            </Link>
          </DropdownMenuItem>
        </div> */}

        {user?.isServerAdmin && (
          <div className="border-stock space-y-2 border-b px-2.5 py-2">
            <DropdownMenuItem
              asChild
              className="h-[2.4375rem] cursor-pointer transition-all hover:bg-[#f5f5f5]"
            >
              <Link to="/server">
                <Shield className="text-base" />
                Server Admin
              </Link>
            </DropdownMenuItem>
          </div>
        )}

        <div className="px-2.5 py-2">
          <DropdownMenuItem
            onClick={async () => {
              trackGTag('logout')
              await signOut()
              window.location.href = '/sign-in'
            }}
            className="hover:text-destructive! h-[2.4375rem] cursor-pointer transition-all hover:bg-red-100!"
          >
            <LogoutIcon className="text-base" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function capitalizeFirstLetter(str: string): string {
  if (!str || typeof str !== 'string') return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function capitalizeBreadcrumbLabel(label: React.ReactNode): React.ReactNode {
  if (typeof label === 'string') {
    return capitalizeFirstLetter(label)
  }
  return label
}
