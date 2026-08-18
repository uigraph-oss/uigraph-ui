import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { UserDropdownMenu } from '@/features/dashboard/dashboard-header'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { type ReactNode } from 'react'

const STEP_LABELS = [
  'Create team',
  'Choose runner',
  'Connect GitHub',
  'Select repository',
  'Check environment',
  'Run',
]

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

export function OnboardingShell({
  stepIndex,
  teamName,
  aside,
  actionsAtBottom,
  children,
  onBack,
  primary,
}: {
  stepIndex: number
  teamName?: string | null
  aside?: ReactNode
  actionsAtBottom?: boolean
  children: ReactNode
  onBack?: () => void
  primary?: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  }
}) {
  const actions = (
    <div className="flex items-center justify-center gap-3">
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

  return (
    <div className="bg-shading-gray text-foreground flex min-h-screen flex-col">
      <header className="border-stock/60 flex items-center gap-4 border-b px-6 py-4 lg:px-10">
        <UiGraphLogo className="size-6 shrink-0" />
        <div className="hidden items-center gap-1.5 sm:flex">
          {STEP_LABELS.map((label, index) => (
            <span
              key={label}
              className={cn(
                'h-1 w-6 rounded-full transition-colors',
                index === stepIndex && 'bg-primary',
                index < stepIndex && 'bg-primary/40',
                index > stepIndex && 'bg-stock'
              )}
            />
          ))}
        </div>
        <span className="text-paragraph text-sm">
          <span className="font-mono text-[0.6875rem]">
            {String(stepIndex + 1).padStart(2, '0')}
          </span>{' '}
          {STEP_LABELS[stepIndex]}
        </span>
        <div className="ml-auto flex items-center gap-4">
          {teamName && (
            <span className="border-stock text-paragraph hidden max-w-40 truncate rounded-md border px-2 py-1 font-mono text-[0.6875rem] lg:block">
              {teamName}
            </span>
          )}
          <UserDropdownMenu />
        </div>
      </header>

      <main
        className={cn(
          'w-full flex-1 px-6 pt-10 lg:px-10',
          actionsAtBottom && 'pb-28',
          !actionsAtBottom && 'pb-16'
        )}
      >
        {aside && (
          <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0">
              {children}
              {!actionsAtBottom && <div className="mt-10">{actions}</div>}
            </div>
            <div className="hidden min-w-0 lg:block">{aside}</div>
          </div>
        )}
        {!aside && (
          <div className="mx-auto w-full max-w-2xl">
            {children}
            {!actionsAtBottom && <div className="mt-10">{actions}</div>}
          </div>
        )}
      </main>

      {actionsAtBottom && (
        <footer className="border-stock/60 bg-shading-gray/90 fixed inset-x-0 bottom-0 border-t px-6 py-4 backdrop-blur lg:px-10">
          <div className="mx-auto w-full max-w-2xl">{actions}</div>
        </footer>
      )}
    </div>
  )
}
