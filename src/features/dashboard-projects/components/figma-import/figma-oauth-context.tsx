'use client'

import { createContext } from 'daily-code/react'
import { useEffect, useState } from 'react'
import { disconnectFigma, getFigmaStatus } from './helpers/figma-api'

const [FigmaOAuthContextProvider, useFigmaOAuthContextCore] = createContext(
  () => {
    const [connected, setConnected] = useState(false)
    const [isAuthLoading, setIsAuthLoading] = useState(false)
    const [isAuthFetched, setIsAuthFetched] = useState(false)

    async function refreshStatus(): Promise<void> {
      try {
        setIsAuthLoading(true)
        const isConnected = await getFigmaStatus()
        setConnected(isConnected)
      } catch (error) {
        setConnected(false)
        console.error('Failed to fetch Figma status:', error)
      } finally {
        setIsAuthFetched(true)
        setIsAuthLoading(false)
      }
    }

    function markConnected() {
      setConnected(true)
    }

    async function disconnect(): Promise<void> {
      await disconnectFigma()
      setConnected(false)
    }

    return {
      connected,

      isAuthLoading,
      isAuthFetched,

      refreshStatus,
      markConnected,
      disconnect,
    }
  }
)

function useFigmaOAuthContext(autoFetch = false) {
  const ctx = useFigmaOAuthContextCore()

  useEffect(() => {
    if (!autoFetch) return

    if (!ctx.isAuthFetched && !ctx.isAuthLoading) {
      ctx.refreshStatus().catch(console.error)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.isAuthFetched, ctx.isAuthLoading, autoFetch])

  return ctx
}

export { FigmaOAuthContextProvider, useFigmaOAuthContext }
