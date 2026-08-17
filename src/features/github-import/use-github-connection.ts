import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import {
  DISCONNECT_GITHUB_APP,
  GITHUB_APP,
  GITHUB_APP_INSTALL_URL,
} from './api'

export function isInstallationConnected(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'CONNECTED') return true
  if (normalized === 'ACTIVE') return true
  if (normalized === 'INSTALLED') return true
  return false
}

export function useGitHubConnection(orgID: string) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const tabRef = useRef<Window | null>(null)

  const installationQuery = useQuery(GITHUB_APP, {
    variables: { orgID },
    fetchPolicy: 'network-only',
    pollInterval: isConnecting ? 5000 : 0,
    onError: (queryError) => setError(queryError.message),
    onCompleted: (data) => {
      if (!data.githubApp) return
      if (!isInstallationConnected(data.githubApp.status)) return
      tabRef.current?.close()
      tabRef.current = null
      setIsConnecting(false)
    },
  })
  const [getInstallURL, { loading: isStarting }] = useMutation(
    GITHUB_APP_INSTALL_URL
  )
  const [disconnectApp, { loading: isDisconnecting }] = useMutation(
    DISCONNECT_GITHUB_APP
  )

  useEffect(() => () => tabRef.current?.close(), [])

  async function connect() {
    setError('')
    const tab = window.open('', 'uigraph-github-app')
    if (!tab) {
      setError('Allow UIGraph to open new tabs, then try again.')
      return
    }
    tabRef.current = tab

    try {
      const result = await getInstallURL({ variables: { orgID } })
      const installURL = result.data?.githubAppInstallURL
      if (!installURL)
        throw new Error('GitHub did not return an installation URL')
      const url = new URL(installURL)
      if (url.protocol !== 'https:') {
        throw new Error('GitHub returned an invalid installation URL')
      }
      tab.opener = null
      tab.location.href = url.href
      setIsConnecting(true)
      await installationQuery.refetch()
    } catch (caught) {
      tab.close()
      tabRef.current = null
      setError(
        caught instanceof Error ? caught.message : 'Could not connect GitHub'
      )
    }
  }

  async function disconnect() {
    setError('')
    try {
      await disconnectApp({ variables: { orgID } })
      setIsConnecting(false)
      await installationQuery.refetch()
      return true
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not disconnect GitHub'
      )
      return false
    }
  }

  const installation = installationQuery.data?.githubApp ?? null

  return {
    installation,
    connected:
      installation !== null && isInstallationConnected(installation.status),
    isLoading: installationQuery.loading && !installationQuery.data,
    isStarting,
    isConnecting,
    isDisconnecting,
    error,
    connect,
    disconnect,
  }
}
