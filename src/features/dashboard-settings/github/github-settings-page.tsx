'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGitHubConnection } from '@/features/github-import/use-github-connection'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuthStore, useCurrentOrganization } from '@/store/auth-store'
import { Github, Loader2, Unplug } from 'lucide-react'
import { toast } from 'sonner'
import { SettingsHeader } from '../components/settings-header'

export function GitHubSettingsPage() {
  const organization = useCurrentOrganization()

  if (!organization) return null

  return <GitHubSettings orgID={organization.id} />
}

function GitHubSettings({ orgID }: { orgID: string }) {
  const { isAdmin } = usePermissions()
  const enabled = useAuthStore((state) => state.features.github)
  const github = useGitHubConnection(orgID)

  const installation = github.installation
  const connected = github.connected

  async function handleDisconnect() {
    if (!(await github.disconnect())) return
    toast.success('GitHub disconnected. Your services are kept.')
  }

  return (
    <>
      <SettingsHeader
        title="GitHub"
        description="Connect the UIGraph GitHub App so it can read your repositories."
      />

      <div className="space-y-4 px-6 pt-4 pb-8">
        {!enabled && (
          <p className="text-paragraph border-stock rounded-[12px] border border-dashed p-6 text-center text-sm">
            The GitHub App is not configured on this deployment.
          </p>
        )}

        {enabled && (
          <div className="border-stock flex flex-wrap items-center gap-4 rounded-[12px] border p-6">
            <span className="bg-stock text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Github className="size-5" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                {installation ? installation.accountLogin : 'Not connected'}
                {installation && (
                  <Badge variant={connected ? 'default' : 'secondary'}>
                    {connected ? 'Connected' : 'Suspended'}
                  </Badge>
                )}
              </p>
              {!connected && (
                <p className="text-paragraph mt-1 text-xs">
                  {installation &&
                    'The app is suspended on GitHub. Re-enable it to keep your repositories in sync.'}
                  {!installation &&
                    'Install the UIGraph GitHub App to connect your repositories.'}
                </p>
              )}
            </div>

            {isAdmin && connected && (
              <Button
                preset="outline"
                className="h-10 rounded-[0.75rem] text-sm"
                disabled={github.isDisconnecting}
                onClick={handleDisconnect}
              >
                <Unplug className="size-4" />
                Disconnect
              </Button>
            )}

            {isAdmin && !connected && (
              <Button
                className="h-10 rounded-[0.75rem] text-sm"
                disabled={github.isStarting || github.isConnecting}
                onClick={github.connect}
              >
                {(github.isStarting || github.isConnecting) && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {!github.isStarting && !github.isConnecting && (
                  <Github className="size-4" />
                )}
                {github.isConnecting && 'Waiting for GitHub…'}
                {!github.isConnecting && 'Connect GitHub'}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
