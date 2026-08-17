import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Github,
  Loader2,
} from 'lucide-react'
import { StepBody, StepFooter, StepHeader } from './step-layout'
import { useGitHubConnection } from './use-github-connection'

function readableAccountType(accountType: string) {
  const normalized = accountType.toUpperCase()
  if (normalized === 'ORGANIZATION') return 'Organization'
  if (normalized === 'USER') return 'Personal account'
  return accountType
}

export function ConnectGitHubStep({
  orgID,
  onBack,
  onNext,
}: {
  orgID: string
  onBack?: () => void
  onNext: () => void
}) {
  const github = useGitHubConnection(orgID)

  return (
    <>
      <StepHeader
        icon={<Github className="size-6" />}
        title="Connect GitHub"
        description="Install the UIGraph app on the account that owns your repository."
      />

      <StepBody>
        {github.isLoading && (
          <div className="text-paragraph flex items-center justify-center gap-2 py-6 text-sm">
            <Loader2 className="size-4 animate-spin" /> Checking installation
          </div>
        )}

        {!github.isLoading && github.connected && github.installation && (
          <div className="border-stock bg-stock/30 flex items-center gap-3 rounded-xl border p-4">
            <span className="bg-success/10 text-success flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Check className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {github.installation.accountLogin}
              </p>
              <p className="text-paragraph mt-0.5 text-xs">
                {readableAccountType(github.installation.accountType)} ·
                Connected
              </p>
            </div>
            <Button
              preset="ghost"
              className="h-9 shrink-0 rounded-[0.625rem] px-3 text-sm has-[>svg]:px-3"
              disabled={github.isDisconnecting}
              onClick={github.disconnect}
            >
              {github.isDisconnecting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Disconnect
            </Button>
          </div>
        )}

        {!github.isLoading && !github.connected && (
          <div className="flex justify-center">
            <Button
              preset="primary"
              disabled={github.isStarting || github.isConnecting}
              onClick={github.connect}
            >
              {(github.isStarting || github.isConnecting) && (
                <Loader2 className="animate-spin" />
              )}
              {github.isConnecting && 'Waiting for GitHub…'}
              {!github.isConnecting && 'Install GitHub App'}
              {!github.isStarting && !github.isConnecting && <ExternalLink />}
            </Button>
          </div>
        )}

        {github.error && (
          <Alert variant="destructive" className="mt-4 text-left">
            <AlertCircle />
            <AlertTitle>GitHub connection failed</AlertTitle>
            <AlertDescription>{github.error}</AlertDescription>
          </Alert>
        )}
      </StepBody>

      {(onBack || github.connected) && (
        <StepFooter>
          {onBack && (
            <Button preset="outline" onClick={onBack}>
              <ArrowLeft /> Back
            </Button>
          )}
          {!onBack && <span />}
          {github.connected && (
            <Button preset="primary" onClick={onNext}>
              Choose a repository <ArrowRight />
            </Button>
          )}
        </StepFooter>
      )}
    </>
  )
}
