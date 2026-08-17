import { Button } from '@/components/ui/button'
import { StepBody, StepFooter } from '@/features/github-import/step-layout'
import { ArrowRight, FileText, Github, Users } from 'lucide-react'

const highlights = [
  {
    icon: <Users className="size-4" />,
    title: 'Create a team',
    description: 'Every repository you import is owned by one of your teams.',
  },
  {
    icon: <Github className="size-4" />,
    title: 'Connect GitHub',
    description: 'Install the UIGraph app and pick a repository to import.',
  },
  {
    icon: <FileText className="size-4" />,
    title: 'Generate documentation',
    description:
      'UIGraph documents the repository on its own branch and syncs it here.',
  },
]

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <>
      <StepBody className="items-center justify-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to UIGraph
        </h1>
        <p className="text-paragraph mt-2 max-w-md text-sm leading-relaxed text-balance">
          Set up your organization in a few steps. Nothing is merged into your
          repositories.
        </p>

        <ul className="mt-8 grid w-full max-w-md gap-2.5 text-left">
          {highlights.map((highlight) => (
            <li
              key={highlight.title}
              className="border-stock flex items-start gap-3 rounded-xl border p-3"
            >
              <span className="bg-stock text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                {highlight.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {highlight.title}
                </span>
                <span className="text-paragraph mt-0.5 block text-xs leading-relaxed">
                  {highlight.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </StepBody>

      <StepFooter>
        <Button preset="primary" className="w-full" onClick={onNext}>
          Get started
          <ArrowRight />
        </Button>
      </StepFooter>
    </>
  )
}
