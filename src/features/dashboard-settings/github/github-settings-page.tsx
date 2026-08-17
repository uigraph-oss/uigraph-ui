'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DISCONNECT_GITHUB_APP,
  GITHUB_APP,
  REPOSITORY_IMPORTS,
  RETRY_REPOSITORY_IMPORT,
} from '@/features/github-import/api'
import { isInstallationConnected } from '@/features/github-import/connect-github-step'
import { usePermissions } from '@/hooks/use-permissions'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { ExternalLink, Github, Plus, RefreshCw, Unplug } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SettingsHeader } from '../components/settings-header'

const STATUS_LABELS: Record<string, string> = {
  SELECTED: 'Starting',
  CHECKING_AI_CONFIGURATION: 'Checking secrets',
  WAITING_AI_CONFIGURATION: 'Waiting on secrets',
  RUN_QUEUED: 'Queued',
  RUN_RUNNING: 'Running',
  COMPLETED: 'Imported',
  FAILED: 'Failed',
}

export function GitHubSettingsPage() {
  const organization = useCurrentOrganization()

  if (!organization) return null

  return <GitHubSettings orgID={organization.id} />
}

function GitHubSettings({ orgID }: { orgID: string }) {
  const { isAdmin } = usePermissions()
  const navigate = useNavigate()

  const installationQuery = useQuery(GITHUB_APP, {
    variables: { orgID },
    onError: (error) => toast.error(error.message),
  })
  const importsQuery = useQuery(REPOSITORY_IMPORTS, {
    variables: { orgID },
    onError: (error) => toast.error(error.message),
    pollInterval: 10000,
  })

  const [disconnect, { loading: isDisconnecting }] = useMutation(
    DISCONNECT_GITHUB_APP,
    {
      refetchQueries: [{ query: GITHUB_APP, variables: { orgID } }],
      awaitRefetchQueries: true,
    }
  )
  const [retry, { loading: isRetrying }] = useMutation(
    RETRY_REPOSITORY_IMPORT,
    {
      refetchQueries: [{ query: REPOSITORY_IMPORTS, variables: { orgID } }],
      awaitRefetchQueries: true,
    }
  )

  const enabled = installationQuery.data?.githubAppEnabled ?? false
  const installation = installationQuery.data?.githubApp ?? null
  const connected = installation
    ? isInstallationConnected(installation.status)
    : false
  const imports = importsQuery.data?.repositoryImports ?? []

  async function handleDisconnect() {
    try {
      await disconnect({ variables: { orgID } })
      toast.success('GitHub disconnected. Your services and history are kept.')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleRetry(importID: string) {
    try {
      await retry({ variables: { orgID, importID } })
      void navigate(`/repositories/import/${importID}`)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <>
      <SettingsHeader
        title="GitHub"
        description="Connect the UIGraph GitHub App and import repositories. UIGraph documents a repository once — after that, its own workflows keep it in sync."
        cta={
          isAdmin &&
          enabled && (
            <Button className="h-11 rounded-[0.75rem] px-6 text-sm" asChild>
              <Link to="/repositories/import">
                {connected && <Plus className="mr-0.5 h-4 w-4" />}
                {!connected && <Github className="mr-0.5 h-4 w-4" />}
                {connected ? 'Add repository' : 'Connect GitHub'}
              </Link>
            </Button>
          )
        }
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
                    {connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                )}
              </p>
              <p className="text-paragraph mt-1 text-xs">
                {connected &&
                  'UIGraph can read this organization’s repositories and open artifact pull requests.'}
                {installation &&
                  !connected &&
                  'The app was disconnected. Past imports and their services are kept.'}
                {!installation &&
                  'Install the UIGraph GitHub App to import a repository.'}
              </p>
            </div>

            {isAdmin && installation && connected && (
              <Button
                preset="outline"
                className="h-10 rounded-[0.75rem] text-sm"
                disabled={isDisconnecting}
                onClick={handleDisconnect}
              >
                <Unplug className="size-4" />
                Disconnect
              </Button>
            )}
          </div>
        )}

        {enabled && (
          <div className="overflow-x-auto rounded-[12px] border border-[#2A3242]">
            <table className="w-full">
              <thead>
                <tr className="border-stock bg-background/50 border-b">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
                    Repository
                  </th>
                  <th className="w-40 px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
                    Team
                  </th>
                  <th className="w-44 px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
                    Result
                  </th>
                  <th className="w-56 px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
                    Imported
                  </th>
                  <th className="w-40 px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {imports.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-32 py-4 text-center text-[#828DA3]"
                    >
                      No repositories imported yet
                    </td>
                  </tr>
                )}

                {imports.map((value) => (
                  <tr
                    key={value.id}
                    className="border-stock border-b last:border-0"
                  >
                    <td className="px-6 py-4">
                      <a
                        href={value.repository.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm hover:underline"
                      >
                        {value.repository.fullName}
                      </a>
                      {value.error && (
                        <p className="text-destructive mt-1 text-xs">
                          {value.error}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        {value.serviceId && (
                          <Link
                            to={`/services/${value.serviceId}`}
                            className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                          >
                            Service
                          </Link>
                        )}
                        {value.runUrl && (
                          <a
                            href={value.runUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                          >
                            Actions run <ExternalLink className="size-3" />
                          </a>
                        )}
                        {value.pullRequestUrl && (
                          <a
                            href={value.pullRequestUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                          >
                            Pull request <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="text-paragraph px-6 py-4 text-sm">
                      {value.teamName ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/repositories/import/${value.id}`}
                        className="text-sm hover:underline"
                      >
                        {STATUS_LABELS[value.status] ?? value.status}
                      </Link>
                    </td>
                    <td className="text-paragraph px-6 py-4 text-sm">
                      {new Date(value.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin &&
                        connected &&
                        (value.status === 'FAILED' ||
                          value.status === 'WAITING_AI_CONFIGURATION') && (
                          <Button
                            preset="outline"
                            className="h-9 rounded-[0.6rem] text-xs"
                            disabled={isRetrying}
                            onClick={() => handleRetry(value.id)}
                          >
                            <RefreshCw className="size-3.5" />
                            Retry
                          </Button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
