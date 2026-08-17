import { Button } from '@/components/ui/button'
import { StepFooter, StepHeader } from '@/features/github-import/step-layout'
import { ArrowRight } from 'lucide-react'

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <>
      <StepHeader
        title="Welcome to UIGraph"
        description="Create a team, connect GitHub, and UIGraph documents your repository."
      />

      <StepFooter>
        <span />
        <Button preset="primary" onClick={onNext}>
          Get started <ArrowRight />
        </Button>
      </StepFooter>
    </>
  )
}
