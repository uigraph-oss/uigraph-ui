import { Button } from '@/components/ui/button'
import { useGitHubConnection } from '@/features/github-import/use-github-connection'
import { cn } from '@/lib/utils'
import { Check, ExternalLink, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { OnboardingShell, StepIntro } from './onboarding-shell'
import { Constellation } from './visuals/constellation'

function readableAccountType(accountType: string) {
  const normalized = accountType.toUpperCase()
  if (normalized === 'ORGANIZATION') return 'Organization'
  if (normalized === 'USER') return 'Personal account'
  return accountType
}

function installationSettingsURL(accountLogin: string, accountType: string) {
  if (accountType.toUpperCase() === 'ORGANIZATION') {
    return `https://github.com/organizations/${accountLogin}/settings/installations`
  }
  return 'https://github.com/settings/installations'
}

function ChecklistRow({
  index,
  title,
  done,
  children,
}: {
  index: number
  title: string
  done: boolean
  children: ReactNode
}) {
  return (
    <li className="flex gap-4 px-5 py-5">
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[0.625rem] transition-colors',
          done && 'border-success/40 bg-success/10 text-success',
          !done && 'border-stock text-paragraph'
        )}
      >
        {done && <Check className="size-3.5" />}
        {!done && index}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', !done && 'text-paragraph')}>
          {title}
        </p>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  )
}

export function ConnectGitHubStep({
  orgID,
  teamName,
  onBack,
  onNext,
}: {
  orgID: string
  teamName: string | null
  onBack: () => void
  onNext: () => Promise<void>
}) {
  const github = useGitHubConnection(orgID)
  const installation = github.connected ? github.installation : null

  return (
    <OnboardingShell
      stepIndex={2}
      teamName={teamName}
      onBack={onBack}
      primary={{
        label: 'Continue',
        onClick: () => void onNext(),
        disabled: !github.connected,
      }}
      aside={
        <Constellation
          connected={github.connected}
          accountLogin={installation?.accountLogin}
        />
      }
    >
      <StepIntro
        eyebrow="GitHub"
        title="Connect the account that owns your code."
        description="UIGraph reads through a GitHub App you install and can remove at any time. It never asks for your password."
      />

      <div className="border-stock bg-shading mt-10 rounded-2xl border">
        {github.isLoading && (
          <div className="text-paragraph flex items-center gap-2 px-5 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" /> Checking installation
          </div>
        )}

        {!github.isLoading && (
          <ol className="divide-stock divide-y">
            <ChecklistRow
              index={1}
              title="Install the UIGraph app"
              done={github.connected}
            >
              {!github.connected && (
                <Button
                  preset="primary"
                  className="h-10 rounded-[0.625rem] text-sm"
                  disabled={github.isStarting || github.isConnecting}
                  onClick={github.connect}
                >
                  {(github.isStarting || github.isConnecting) && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {github.isConnecting && 'Waiting for GitHub…'}
                  {!github.isConnecting && 'Install GitHub App'}
                  {!github.isStarting && !github.isConnecting && (
                    <ExternalLink className="size-4" />
                  )}
                </Button>
              )}
              {github.connected && (
                <p className="text-paragraph font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                  Installed
                </p>
              )}
            </ChecklistRow>

            <ChecklistRow
              index={2}
              title="Account"
              done={installation !== null}
            >
              {!installation && (
                <p className="text-paragraph text-sm">
                  The account you install on shows up here.
                </p>
              )}
              {installation && (
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-sm">
                      {installation.accountLogin}
                    </span>
                    <span className="text-paragraph mt-0.5 block font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                      {readableAccountType(installation.accountType)}
                    </span>
                  </span>
                  <Button
                    preset="ghost"
                    className="text-paragraph h-9 shrink-0 rounded-[0.625rem] px-3 text-sm has-[>svg]:px-3"
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
            </ChecklistRow>

            <ChecklistRow
              index={3}
              title="Repository access"
              done={installation !== null}
            >
              {!installation && (
                <p className="text-paragraph text-sm">
                  Choose which repositories UIGraph can read while you install.
                </p>
              )}
              {installation && (
                <a
                  href={installationSettingsURL(
                    installation.accountLogin,
                    installation.accountType
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-1.5 text-sm hover:underline"
                >
                  Change repository access on GitHub
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </ChecklistRow>
          </ol>
        )}
      </div>
    </OnboardingShell>
  )
}
