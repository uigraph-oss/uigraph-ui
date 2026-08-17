import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMutation } from '@apollo/client'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FlaskConical,
  Loader2,
  Play,
  Workflow,
} from 'lucide-react'
import { useState } from 'react'
import { START_REPOSITORY_IMPORT } from './api'
import { SecretsGuidance } from './secrets-guidance'
import type { SelectedRepository } from './select-repository-step'
import { StepBody, StepFooter, StepHeader } from './step-layout'

export function SyncOptionStep({
  orgID,
  teamID,
  repository,
  onBack,
  onStarted,
}: {
  orgID: string
  teamID: string
  repository: SelectedRepository
  onBack: () => void
  onStarted: (importID: string) => void
}) {
  const [error, setError] = useState('')
  const [startImport, { loading: isStarting }] = useMutation(
    START_REPOSITORY_IMPORT
  )

  async function handleStart() {
    setError('')
    try {
      const result = await startImport({
        variables: { orgID, teamID, repositoryID: repository.id },
      })
      const id = result.data?.startRepositoryImport.id
      if (!id) throw new Error('The import started without an ID')
      onStarted(id)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not start the import'
      )
    }
  }

  return (
    <>
      <StepHeader
        title="How should UIGraph run?"
        description={
          <>
            <span className="text-foreground font-medium">
              {repository.fullName}
            </span>{' '}
            is documented on its own branch.
          </>
        }
      />

      <StepBody>
        <div className="grid shrink-0 gap-3 sm:grid-cols-2">
          <div className="border-primary bg-primary/5 flex flex-col rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Workflow className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium">GitHub Actions</span>
              <Check className="text-primary size-4 shrink-0" />
            </div>
            <p className="text-paragraph mt-3 text-xs leading-relaxed">
              Runs on your own runners. Your code never leaves GitHub.
            </p>
          </div>

          <div className="border-stock flex flex-col rounded-xl border p-4 opacity-60">
            <div className="flex items-center gap-3">
              <span className="bg-stock text-paragraph flex size-9 shrink-0 items-center justify-center rounded-lg">
                <FlaskConical className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium">
                UIGraph Sandbox
              </span>
              <Badge variant="secondary" className="shrink-0">
                Coming soon
              </Badge>
            </div>
            <p className="text-paragraph mt-3 text-xs leading-relaxed">
              Runs in a UIGraph-hosted sandbox, with no workflows added.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <SecretsGuidance orgID={orgID} />
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4 shrink-0">
            <AlertCircle />
            <AlertTitle>Could not start the import</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </StepBody>

      <StepFooter>
        <Button preset="outline" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button
          preset="primary"
          disabled={isStarting}
          onClick={handleStart}
          className={cn(isStarting && 'pointer-events-none')}
        >
          {isStarting && <Loader2 className="animate-spin" />}
          {!isStarting && <Play />}
          Start import
        </Button>
      </StepFooter>
    </>
  )
}
