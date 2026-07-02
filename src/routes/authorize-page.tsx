'use client'

import { CircleLoader } from '@/components/loader/circle-loader'
import { Paths } from '@/constants'
import { mintSessionToken, useAuthStore } from '@/store/auth-store'
import { useEffect, useState } from 'react'

export function AuthorizePage() {
  const status = useAuthStore((state) => state.status)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    const query = new URLSearchParams(window.location.search)
    const redirectUri = query.get('redirect_uri')
    const state = query.get('state')

    if (!redirectUri || !state) {
      setError('Missing redirect_uri or state.')
      return
    }

    if (status === 'unauthenticated') {
      const next = window.location.pathname + window.location.search
      window.location.href = `${Paths.auth.signin}?next=${encodeURIComponent(next)}`
      return
    }

    mintSessionToken()
      .then((token) => {
        const target = new URL(redirectUri)
        target.searchParams.set('token', token)
        target.searchParams.set('state', state)
        window.location.href = target.toString()
      })
      .catch((e) => {
        setError((e as Error).message || 'Authorization failed.')
      })
  }, [status])

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6"
      style={{ background: '#0B0E16', color: '#F4F7FC' }}
    >
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <>
          <CircleLoader />
          <p style={{ fontSize: 14, color: '#828DA3' }}>Authorizing…</p>
        </>
      )}
    </div>
  )
}
