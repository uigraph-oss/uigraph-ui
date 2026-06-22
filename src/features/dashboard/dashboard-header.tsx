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
import { cn } from '@/lib/utils'
import {
  changeOrganization,
  signOut,
  useAuthStore,
  useCurrentOrganization,
} from '@/store/auth-store'
import { Check, Shield } from 'lucide-react'
import { Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const organizations = useAuthStore((state) => state.organizations)
  const currentOrganization = useCurrentOrganization()

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
        className="border-stock bg-shading min-w-[16rem] overflow-hidden p-0"
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Avatar className="size-9 shrink-0">
            <AvatarImage
              src={user?.avatarUrl || ''}
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback className="bg-paragraph/20 text-foreground/70 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-semibold">{user?.name}</span>
            <span className="text-paragraph truncate text-sm">
              {user?.email}
            </span>
          </div>
        </div>

        {organizations.length > 0 && (
          <div className="border-stock border-t px-2 py-2">
            <DropdownMenuLabel className="text-paragraph px-2 pt-1 pb-1.5 text-[0.6875rem] font-semibold tracking-wider uppercase">
              Organizations
            </DropdownMenuLabel>

            <div className="max-h-[15rem] space-y-0.5 overflow-y-auto">
              {organizations.map((organization) => {
                const isActive = organization.id === currentOrganization?.id

                const orgInitials = organization.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()

                return (
                  <DropdownMenuItem
                    key={organization.id}
                    className={cn(
                      'h-[2.75rem] cursor-pointer gap-3 rounded-lg px-2 transition-colors hover:bg-white/[0.06]',
                      isActive && 'bg-primary/10 hover:bg-primary/15'
                    )}
                    onClick={() => {
                      if (!isActive) {
                        changeOrganization(organization.id)
                        void navigate('/dashboard')
                      }
                    }}
                  >
                    <Avatar className="size-8 shrink-0 rounded-md">
                      <AvatarImage
                        src={organization.logoUrl || ''}
                        alt={organization.name}
                        className="rounded-md object-cover"
                      />
                      <AvatarFallback className="bg-paragraph/15 text-foreground/70 rounded-md text-xs font-bold">
                        {orgInitials}
                      </AvatarFallback>
                    </Avatar>

                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {organization.name}
                      </span>
                      <span className="text-paragraph truncate text-xs capitalize">
                        {organization.role.toLowerCase()}
                      </span>
                    </span>

                    {isActive && (
                      <Check className="text-primary ml-auto size-4 shrink-0" />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </div>
          </div>
        )}

        <div className="border-stock space-y-0.5 border-t px-2 py-2">
          {user?.isServerAdmin && (
            <DropdownMenuItem
              asChild
              className="h-[2.5rem] cursor-pointer rounded-lg px-2 transition-colors hover:bg-white/[0.06]"
            >
              <Link to="/server">
                <Shield className="size-4" />
                Manage Server
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={async () => {
              await signOut()
              window.location.href = '/sign-in'
            }}
            className="text-destructive focus:text-destructive hover:text-destructive h-[2.5rem] cursor-pointer rounded-lg px-2 transition-colors hover:bg-red-500/10 focus:bg-red-500/10"
          >
            <LogoutIcon className="size-4" />
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
