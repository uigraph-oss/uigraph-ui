'use client'

import { createContext } from 'daily-code/react'
import { useEffect, useState } from 'react'

const [FigmaOAuthContextProvider, useFigmaOAuthContextCore] = createContext(
  () => {
    const [refreshToken, setRefreshTokenState] = useState<string | null>(() => {
      const refreshToken = localStorage.getItem('figma-refresh-token')
      return refreshToken ?? null
    })

    const [isAuthLoading, setIsAuthLoading] = useState(false)
    const [isAuthFetched, setIsAuthFetched] = useState(false)
    const [accessToken, setAccessTokenState] = useState<string | null>(null)

    function setAccessToken(token: string) {
      setAccessTokenState(token)
      setIsAuthFetched(true)
    }

    function setRefreshToken(token: string) {
      setRefreshTokenState(token)
      localStorage.setItem('figma-refresh-token', token)
    }

    function removeRefreshToken() {
      setAccessTokenState(null)
      setRefreshTokenState(null)
      localStorage.removeItem('figma-refresh-token')
    }

    async function initOAuth(): Promise<void> {
      if (accessToken) return

      if (!refreshToken) {
        return setIsAuthFetched(true)
      }

      try {
        setIsAuthLoading(true)

        // Mock: no server to refresh the Figma token in this build.
        const tokens = { access_token: 'mock-figma-access-token' }
        setAccessToken(tokens.access_token)
      } catch (error) {
        removeRefreshToken()
        setIsAuthFetched(true)

        console.error('Failed to refresh Figma token:', error)
      } finally {
        setIsAuthLoading(false)
      }
    }

    return {
      refreshToken,
      accessToken,

      isAuthLoading,
      isAuthFetched,

      setRefreshToken,
      removeRefreshToken,

      setAccessToken,

      initOAuth,
    }
  }
)

function useFigmaOAuthContext(autoFetch = false) {
  const ctx = useFigmaOAuthContextCore()

  useEffect(() => {
    if (!autoFetch) return

    if (!ctx.isAuthFetched && !ctx.isAuthLoading) {
      ctx.initOAuth().catch(console.error)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.isAuthFetched, ctx.isAuthLoading, autoFetch])

  return ctx
}

export { FigmaOAuthContextProvider, useFigmaOAuthContext }
