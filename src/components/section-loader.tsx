'use client'

import { SuperLogoLoader } from '@/components/loader/super-logo-loader'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function SectionLoader({
  label,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & { label?: string }) {
  return (
    <div
      {...props}
      className={cn(
        'flex h-[400px] w-full flex-col items-center justify-center gap-4',
        className
      )}
    >
      <SuperLogoLoader />
      {label && <p className="text-paragraph text-sm">{label}</p>}
    </div>
  )
}
