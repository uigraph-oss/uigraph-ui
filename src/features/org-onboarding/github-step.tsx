import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Github,
  Loader2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  DISCONNECT_GITHUB_APP,
  GITHUB_APP,
  GITHUB_APP_INSTALL_URL,
} from './api'
import {
  compactButtonClass,
  StepBody,
  StepFooter,
  StepHeader,
} from './step-layout'

function isInstallationConnected(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'CONNECTED') return true
  if (normalized === 'ACTIVE') return true
  if (normalized === 'INSTALLED') return true
  return false
}

function readableAccountType(accountType: string) {
  const normalized = accountType.toUpperCase()
  if (normalized === 'ORGANIZATION') return 'Organization'
  if (normalized === 'USER') return 'Personal account'
  return accountType
}

export function GitHubStep({
  orgID,
  onBack,
  onNext,
}: {
  orgID: string
  onBack: () => void
  onNext: () => void
}) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const popupRef = useRef<Window | null>(null)
  const installationQuery = useQuery(GITHUB_APP, {
    variables: { orgID },
    fetchPolicy: 'network-only',
    pollInterval: isConnecting ? 5000 : 0,
    onCompleted: (data) => {
      if (!data.githubApp) return
      if (!isInstallationConnected(data.githubApp.status)) return
      popupRef.current?.close()
      popupRef.current = null
      setIsConnecting(false)
    },
  })
  const [getInstallURL, { loading: isStarting }] = useMutation(
    GITHUB_APP_INSTALL_URL
  )
  const [disconnect, { loading: isDisconnecting }] = useMutation(
    DISCONNECT_GITHUB_APP
  )
  const installation = installationQuery.data?.githubApp
  const connected = Boolean(
    installation && isInstallationConnected(installation.status)
  )
  const isLoadingInstallation =
    installationQuery.loading && !installationQuery.data

  useEffect(() => () => popupRef.current?.close(), [])

  async function handleConnect() {
    setError('')
    const popup = window.open(
      '',
      'uigraph-github-app',
      'popup,width=720,height=760'
    )
    if (!popup) {
      setError('Allow popups for UIGraph, then try again.')
      return
    }
    popupRef.current = popup

    try {
      const result = await getInstallURL({ variables: { orgID } })
      const installURL = result.data?.githubAppInstallURL
      if (!installURL)
        throw new Error('GitHub did not return an installation URL')
      const url = new URL(installURL)
      if (url.protocol !== 'https:') {
        throw new Error('GitHub returned an invalid installation URL')
      }
      popup.opener = null
      popup.location.href = url.href
      setIsConnecting(true)
      await installationQuery.refetch()
    } catch (caught) {
      popup.close()
      popupRef.current = null
      setError(
        caught instanceof Error ? caught.message : 'Could not connect GitHub'
      )
    }
  }

  async function handleDisconnect() {
    setError('')
    try {
      await disconnect({ variables: { orgID } })
      setIsConnecting(false)
      await installationQuery.refetch()
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not disconnect GitHub'
      )
    }
  }

  return (
    <>
      <StepHeader
        icon={<Github className="size-6" />}
        title="Connect GitHub"
        description="Install the UIGraph app and grant it access to the repositories you want to onboard."
      />

      <StepBody className="justify-center">
        {isLoadingInstallation && (
          <div className="text-paragraph flex items-center justify-center gap-2 py-6 text-sm">
            <Loader2 className="size-4 animate-spin" /> Checking installation
          </div>
        )}

        {!isLoadingInstallation && connected && installation && (
          <div className="border-stock bg-stock/30 flex items-center gap-3 rounded-xl border p-4">
            <span className="bg-success/10 text-success flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Check className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {installation.accountLogin}
              </p>
              <p className="text-paragraph mt-0.5 text-xs">
                {readableAccountType(installation.accountType)} · Connected
              </p>
            </div>
            <Button
              preset="ghost"
              className={cn(compactButtonClass, 'shrink-0')}
              disabled={isDisconnecting}
              onClick={handleDisconnect}
            >
              {isDisconnecting && <Loader2 className="size-4 animate-spin" />}
              Disconnect
            </Button>
          </div>
        )}

        {!isLoadingInstallation && !connected && (
          <div className="flex flex-col items-center gap-3">
            <Button
              preset="primary"
              className="w-full max-w-xs"
              disabled={isStarting || isConnecting}
              onClick={handleConnect}
            >
              {(isStarting || isConnecting) && (
                <Loader2 className="animate-spin" />
              )}
              {isConnecting && 'Waiting for GitHub…'}
              {!isConnecting && 'Install GitHub App'}
              {!isStarting && !isConnecting && <ExternalLink />}
            </Button>
            {isConnecting && (
              <p className="text-paragraph text-center text-xs">
                Finish the installation in the GitHub window. This step updates
                on its own.
              </p>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4 text-left">
            <AlertCircle />
            <AlertTitle>GitHub connection failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </StepBody>

      <StepFooter>
        <Button preset="outline" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button preset="primary" disabled={!connected} onClick={onNext}>
          Choose repositories <ArrowRight />
        </Button>
      </StepFooter>
    </>
  )
}
