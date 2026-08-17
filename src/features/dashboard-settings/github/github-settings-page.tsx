'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DISCONNECT_GITHUB_APP,
  GITHUB_APP,
  GITHUB_APP_INSTALL_URL,
  REPOSITORY_IMPORTS,
  RETRY_REPOSITORY_IMPORT,
} from '@/features/github-import/api'
import { isInstallationConnected } from '@/features/github-import/connect-github-step'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuthStore, useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import {
  ExternalLink,
  Github,
  Loader2,
  Plus,
  RefreshCw,
  Unplug,
} from 'lucide-react'
import { useState } from 'react'
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
  const enabled = useAuthStore((state) => state.features.github)
  const navigate = useNavigate()
  const [isConnecting, setIsConnecting] = useState(false)

  const installationQuery = useQuery(GITHUB_APP, {
    variables: { orgID },
    onError: (error) => toast.error(error.message),
    pollInterval: isConnecting ? 5000 : 0,
    onCompleted: (data) => {
      if (!data.githubApp) return
      if (!isInstallationConnected(data.githubApp.status)) return
      setIsConnecting(false)
    },
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
  const [getInstallURL, { loading: isStarting }] = useMutation(
    GITHUB_APP_INSTALL_URL
  )
  const [retry, { loading: isRetrying }] = useMutation(
    RETRY_REPOSITORY_IMPORT,
    {
      refetchQueries: [{ query: REPOSITORY_IMPORTS, variables: { orgID } }],
      awaitRefetchQueries: true,
    }
  )

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

  async function handleConnect() {
    const tab = window.open('', 'uigraph-github-app')
    if (!tab) {
      toast.error('Allow UIGraph to open new tabs, then try again.')
      return
    }

    try {
      const result = await getInstallURL({ variables: { orgID } })
      const installURL = result.data?.githubAppInstallURL
      if (!installURL)
        throw new Error('GitHub did not return an installation URL')
      tab.opener = null
      tab.location.href = installURL
      setIsConnecting(true)
    } catch (error) {
      tab.close()
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
        description="Connect the UIGraph GitHub App and import repositories."
        cta={
          isAdmin &&
          enabled &&
          connected && (
            <Button className="h-11 rounded-[0.75rem] px-6 text-sm" asChild>
              <Link to="/repositories/import">
                <Plus className="mr-0.5 h-4 w-4" />
                Add repository
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
              {!connected && (
                <p className="text-paragraph mt-1 text-xs">
                  {installation && 'Disconnected. Past imports are kept.'}
                  {!installation &&
                    'Install the UIGraph GitHub App to import a repository.'}
                </p>
              )}
            </div>

            {isAdmin && connected && (
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

            {isAdmin && !connected && (
              <Button
                className="h-10 rounded-[0.75rem] text-sm"
                disabled={isStarting || isConnecting}
                onClick={handleConnect}
              >
                {(isStarting || isConnecting) && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {!isStarting && !isConnecting && <Github className="size-4" />}
                {isConnecting && 'Waiting for GitHub…'}
                {!isConnecting && 'Connect GitHub'}
              </Button>
            )}
          </div>
        )}

        {enabled && imports.length > 0 && (
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
