import { UiGraphLogo } from '@/components/logo'
import { UserDropdownMenu } from '@/features/dashboard/dashboard-header'
import { type ReactNode } from 'react'

export function OnboardingLayout({
  headerLeftContent,
  headerCenterContent,
  headerRightContent,
  footer,
  children,
}: {
  headerLeftContent?: ReactNode
  headerCenterContent?: ReactNode
  headerRightContent?: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bg-shading-gray text-foreground flex min-h-screen flex-col">
      <header className="border-stock/60 grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-6">
          <UiGraphLogo className="size-6 shrink-0" />
          {headerLeftContent}
        </div>

        {headerCenterContent && (
          <div className="flex min-w-0 flex-1 items-center justify-center">
            {headerCenterContent}
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          {headerRightContent}
          <UserDropdownMenu />
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col px-6 py-12 lg:px-10">
        <div className="m-auto w-full">{children}</div>
      </main>

      {footer && (
        <footer className="border-stock/60 bg-shading-gray/90 sticky bottom-0 border-t px-6 py-4 backdrop-blur lg:px-10">
          {footer}
        </footer>
      )}
    </div>
  )
}
