import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { signOut } from '@/store/auth-store'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

export const STEP_RAIL = [
  { key: 'TEAM', label: 'Create team' },
  { key: 'RUNNER', label: 'Choose runner' },
  { key: 'GITHUB', label: 'Connect GitHub' },
  { key: 'REPOSITORY', label: 'Select repository' },
  { key: 'ENVIRONMENT', label: 'Check environment' },
  { key: 'RUN', label: 'Map the repository' },
] as const

export function StepIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <div>
      <p className="text-paragraph font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-3xl leading-[1.15] font-medium tracking-tight lg:text-[2.5rem]">
        {title}
      </h1>
      {description && (
        <p className="text-paragraph mt-4 max-w-md text-sm leading-relaxed">
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
  children,
  onBack,
  primary,
}: {
  stepIndex: number
  teamName?: string | null
  aside?: ReactNode
  children: ReactNode
  onBack?: () => void
  primary?: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  }
}) {
  useEffect(() => {
    if (!primary || primary.disabled || primary.loading) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      primary?.onClick()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [primary])

  return (
    <div className="bg-shading-gray text-foreground flex min-h-screen flex-col">
      <header className="flex items-center gap-5 px-6 py-5 lg:px-10">
        <UiGraphLogo className="size-7 shrink-0" />
        <div className="hidden items-center gap-2 sm:flex">
          {STEP_RAIL.map((item, index) => (
            <div key={item.key} className="flex items-center gap-2">
              {index > 0 && <span className="bg-stock h-px w-5" />}
              <span
                className={cn(
                  'font-mono text-[0.6875rem] tracking-[0.12em] transition-colors',
                  index === stepIndex && 'text-foreground',
                  index < stepIndex && 'text-success',
                  index > stepIndex && 'text-paragraph/40'
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
        <span className="text-paragraph font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
          {STEP_RAIL[stepIndex]?.label}
        </span>
        {teamName && (
          <motion.span
            layoutId="onboarding-team-chip"
            className="border-stock bg-shading ml-auto hidden truncate rounded-full border px-3 py-1 font-mono text-[0.6875rem] tracking-[0.08em] lg:block"
          >
            {teamName}
          </motion.span>
        )}
      </header>

      <main className="flex flex-1 items-center px-6 pt-4 pb-28 lg:px-10">
        {aside && (
          <div className="grid w-full items-center gap-12 lg:grid-cols-2">
            <div className="min-w-0">{children}</div>
            <div className="hidden min-w-0 lg:block">{aside}</div>
          </div>
        )}
        {!aside && <div className="mx-auto w-full max-w-3xl">{children}</div>}
      </main>

      <footer className="border-stock/70 bg-shading-gray/85 fixed inset-x-0 bottom-0 flex items-center justify-between border-t px-6 py-4 backdrop-blur lg:px-10">
        <Button
          preset="ghost"
          className="text-paragraph h-9 rounded-[0.625rem] px-3 text-sm"
          onClick={() => void signOut()}
        >
          Log out
        </Button>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button preset="outline" onClick={onBack}>
              <ArrowLeft /> Back
            </Button>
          )}
          {primary && (
            <Button
              preset="primary"
              disabled={primary.disabled || primary.loading}
              onClick={primary.onClick}
            >
              {primary.loading && <Loader2 className="animate-spin" />}
              {primary.label}
              <kbd className="bg-primary-foreground/15 rounded px-1.5 py-0.5 font-mono text-[0.625rem]">
                ⌘ ↵
              </kbd>
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
