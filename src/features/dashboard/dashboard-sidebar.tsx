'use client'

import { UiGraphLogo } from '@/components/logo'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DASHBOARD_NAV_LINKS } from '@/constants'
import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router-dom'

export function DashboardSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className={'flex h-full flex-col gap-[1.31rem] bg-gray-100 py-4'}>
      <div className={'px-4'}>
        <Link
          to="/dashboard"
          className={'flex items-center justify-center rounded-full'}
        >
          <UiGraphLogo className={'w-full'} />
        </Link>
      </div>

      <TooltipProvider delayDuration={400}>
        <ul className={'flex w-full flex-col gap-3 px-2'}>
          {DASHBOARD_NAV_LINKS.map((item) => {
            const isActive = item.isActive(pathname)

            const link = (
              <Link
                to={item.disabled ? '' : item.id}
                className={cn(
                  'block rounded-[0.75rem] p-1 transition-all',
                  item.disabled
                    ? 'text-paragraph cursor-not-allowed'
                    : [
                        isActive || 'cursor-pointer hover:bg-gray-200',
                        isActive && 'text-primary cursor-default',
                      ]
                )}
              >
                <span
                  className={cn(
                    'mx-auto flex size-10 items-center justify-center bg-transparent text-2xl transition-all *:transition-all',
                    isActive && 'bg-primary/5 rounded-[0.75rem]'
                  )}
                >
                  {item.icon}
                </span>

                <span className="block text-center text-[10px]">
                  {item.label}
                </span>
              </Link>
            )

            return (
              <li key={item.id} className="relative block select-none">
                <Tooltip>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">
                    {typeof item.disabled === 'string'
                      ? item.disabled
                      : item.label}
                  </TooltipContent>
                </Tooltip>

                {typeof item.disabled === 'string' && (
                  <p className="absolute inset-0 flex cursor-not-allowed items-center justify-center rounded-[0.75rem] bg-black/10 text-center text-sm opacity-0 backdrop-blur-xs transition-all hover:opacity-100">
                    {item.disabled}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </TooltipProvider>
    </aside>
  )
}
