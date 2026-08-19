import { Button } from '@/components/ui/button'
import { Check, ExternalLink, Loader2 } from 'lucide-react'
import { LuGithub } from 'react-icons/lu'
import { useGitHubConnection } from './use-github-connection'

function readableAccountType(accountType: string) {
  const normalized = accountType.toUpperCase()
  if (normalized === 'ORGANIZATION') return 'Organization'
  if (normalized === 'USER') return 'Personal account'
  return accountType
}

export function ConnectGitHubCard({
  github,
}: {
  github: ReturnType<typeof useGitHubConnection>
}) {
  const installation = github.connected ? github.installation : null

  return (
    <div className="border-stock bg-shading/40 rounded-2xl border px-6 py-8 text-center">
      {github.isLoading && (
        <div className="text-paragraph flex h-56 items-center justify-center gap-2.5 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Checking your installation
        </div>
      )}

      {!github.isLoading && (
        <>
          <span className="border-stock bg-shading text-foreground mx-auto flex size-12 items-center justify-center rounded-2xl border">
            <LuGithub className="size-6" />
          </span>

          <h2 className="mt-5 text-lg font-medium tracking-tight">
            {!installation && 'Connect the account that owns your code.'}
            {installation && 'GitHub is connected.'}
          </h2>

          <p className="text-paragraph mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            {!installation &&
              'UIGraph reads through a GitHub App you install and can remove at any time. It never asks for your password.'}
            {installation &&
              'UIGraph reads this account through the app you installed. Remove it on GitHub whenever you want to revoke access.'}
          </p>

          {!installation && (
            <>
              <Button
                preset="primary"
                className="mt-6 w-full rounded-[0.625rem]"
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
              <p className="text-paragraph mt-3 text-xs">
                Opens github.com in a new tab and returns here once the install
                finishes.
              </p>
            </>
          )}

          {installation && (
            <div className="border-stock bg-shading mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-left">
              <span className="border-success/40 bg-success/10 text-success flex size-8 shrink-0 items-center justify-center rounded-full border">
                <Check className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-sm">
                  {installation.accountLogin}
                </span>
                <span className="text-paragraph mt-0.5 block text-xs">
                  {readableAccountType(installation.accountType)}
                </span>
              </span>
              <Button
                preset="ghost"
                className="text-paragraph h-9 shrink-0 rounded-[0.625rem] px-3 text-xs has-[>svg]:px-3"
                disabled={github.isDisconnecting}
                onClick={github.disconnect}
              >
                {github.isDisconnecting && (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                Disconnect
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
