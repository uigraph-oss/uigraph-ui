import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { UserDropdownMenu } from '@/features/dashboard/dashboard-header'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { type ReactNode } from 'react'

const STEPS = [
  'Choose runner',
  'Connect GitHub',
  'Select repository',
  'Check environment',
  'Run',
]

export function OnboardingLayout({
  header,
  footer,
  children,
}: {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bg-shading-gray text-foreground flex min-h-screen flex-col">
      <header className="border-stock/60 flex h-16 shrink-0 items-center gap-6 border-b px-6 lg:px-10">
        <UiGraphLogo className="size-6 shrink-0" />
        <div className="flex min-w-0 flex-1 items-center gap-4">{header}</div>
        <UserDropdownMenu />
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

export function OnboardingSteps({
  current,
  teamName,
}: {
  current: number
  teamName?: string | null
}) {
  return (
    <>
      <div className="hidden items-center gap-1.5 sm:flex">
        {STEPS.map((label, index) => (
          <span
            key={label}
            className={cn(
              'h-1 w-6 rounded-full transition-colors',
              index === current && 'bg-primary',
              index < current && 'bg-primary/40',
              index > current && 'bg-stock'
            )}
          />
        ))}
      </div>
      <span className="text-paragraph text-sm">
        <span className="font-mono text-[0.6875rem]">
          {String(current + 1).padStart(2, '0')}
        </span>{' '}
        {STEPS[current]}
      </span>
      {teamName && (
        <span className="border-stock text-paragraph ml-auto hidden max-w-40 truncate rounded-md border px-2 py-1 font-mono text-[0.6875rem] lg:block">
          {teamName}
        </span>
      )}
    </>
  )
}

export function OnboardingActions({
  onBack,
  primary,
}: {
  onBack?: () => void
  primary?: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  }
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3">
      {onBack && (
        <Button
          preset="outline"
          className="h-11 max-w-[18rem] flex-1 rounded-[0.625rem]"
          onClick={onBack}
        >
          <ArrowLeft /> Back
        </Button>
      )}
      {primary && (
        <Button
          preset="primary"
          className="h-11 max-w-[18rem] flex-1 rounded-[0.625rem]"
          disabled={primary.disabled || primary.loading}
          onClick={primary.onClick}
        >
          {primary.loading && <Loader2 className="animate-spin" />}
          {primary.label}
          <ArrowRight />
        </Button>
      )}
    </div>
  )
}

export function StepIntro({
  title,
  description,
}: {
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight lg:text-[1.75rem]">
        {title}
      </h1>
      {description && (
        <p className="text-paragraph mt-2 max-w-lg text-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
