import { Button } from '@/components/ui/button'
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

export function OnboardingSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-4">
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
    </div>
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
