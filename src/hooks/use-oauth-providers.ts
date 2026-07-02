import { useEffect, useState } from 'react'

export interface AuthProvider {
  name: string
  displayName: string
  iconUrl: string
  loginUrl: string
}

export function useOAuthProviders() {
  const [isLoading, setIsLoading] = useState(true)
  const [providers, setProviders] = useState<AuthProvider[]>(() => {
    try {
      const storedProviders = localStorage.getItem('authProviders')
      if (storedProviders) {
        return JSON.parse(storedProviders) as AuthProvider[]
      }
    } catch {}

    return []
  })

  useEffect(() => {
    void (async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/v1/auth/providers', {
          credentials: 'include',
        })

        if (!res.ok) {
          return
        }

        const data = (await res.json()) as { providers: AuthProvider[] }

        setProviders(data.providers)
        localStorage.setItem('authProviders', JSON.stringify(data.providers))
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  return {
    isLoading: isLoading && providers.length === 0,
    oAuthProviders: providers,
  }
}
