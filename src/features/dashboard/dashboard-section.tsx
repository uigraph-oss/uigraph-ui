'use client'

import { cn } from '@/lib/utils'
import { Prettify } from '@apollo/client/utilities'
import { ComponentProps, PropsWithChildren, ReactNode } from 'react'
import { DashboardPageLayout } from './dashboard-layout'

export function DashboardPageSectionLayout({
  crumbs,
  children,
  noPadding,
  headerContent,
  ...props
}: PropsWithChildren<DashboardSectionLayoutProps>) {
  return (
    <DashboardPageLayout crumbs={crumbs}>
      <div className={'flex h-full flex-col'}>
        <DashboardSectionHeader {...props}>
          {headerContent}
        </DashboardSectionHeader>

        <DashboardSectionContent noPadding={noPadding}>
          {children}
        </DashboardSectionContent>
      </div>
    </DashboardPageLayout>
  )
}

export function DashboardSectionHeader({
  title,
  children,
  description,
}: PropsWithChildren<DashboardSectionHeaderProps>) {
  return (
    <div className="bg-card flex items-center justify-between gap-4 border-b border-[#2A3242] px-4 py-6 pt-4">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-[#F4F7FC]">{title}</h2>
        <p className="text-sm leading-[1.33] font-normal text-[#828DA3]">
          {description}
        </p>
      </div>

      <div>{children}</div>
    </div>
  )
}

export function DashboardSectionContent({
  noPadding,
  className,
  ...props
}: ComponentProps<'div'> & DashboardSectionContentProps) {
  return (
    <div
      className={cn(
        'flex size-full flex-1 flex-col',
        !noPadding && 'px-4 pt-4 pb-6',
        className
      )}
      {...props}
    />
  )
}

type DashboardSectionHeaderProps = {
  title: string
  description: string
}

type DashboardSectionContentProps = {
  noPadding?: boolean
}

type DashboardSectionLayoutProps = Prettify<
  DashboardSectionHeaderProps &
    DashboardSectionContentProps & {
      crumbs: { to: string; label: ReactNode }[]
      headerContent?: ReactNode
    }
>
