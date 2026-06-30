'use client'

import {
  inferAuthConfig,
  type AuthConfig,
} from '@/utils/api/auth-resolver'
import type { AuthKind } from '@/utils/api/openapi-runtime'
import { useCallback, useEffect, useState } from 'react'

export function getTryItAuthStorageKey(
  serviceId: string | undefined,
  authKind: AuthKind,
  schemeName?: string
) {
  const suffix = schemeName ?? authKind
  return serviceId
    ? `tryit-auth-${serviceId}-${suffix}`
    : `tryit-auth-${suffix}`
}

function getLegacyTryItAuthStorageKey(
  serviceId: string | undefined,
  authKind: AuthKind
) {
  return serviceId
    ? `tryit-auth-${serviceId}-${authKind}`
    : `tryit-auth-${authKind}`
}

export function loadAuthForScheme(
  serviceId: string | undefined,
  schemeName: string,
  scheme: {
    type?: string
    scheme?: string
    name?: string
    in?: string
  }
): AuthConfig {
  const kind = authKindFromSecurityScheme(scheme)
  const keys = [
    getTryItAuthStorageKey(serviceId, kind, schemeName),
    getLegacyTryItAuthStorageKey(serviceId, kind),
  ]

  for (const key of keys) {
    const stored = localStorage.getItem(key)
    if (!stored) continue
    try {
      const parsed = JSON.parse(stored) as AuthConfig
      return {
        kind,
        ...inferAuthConfig({ [schemeName]: scheme }, schemeName),
        ...parsed,
      }
    } catch {
      // ignore invalid storage
    }
  }

  return {
    kind,
    ...inferAuthConfig({ [schemeName]: scheme }, schemeName),
  }
}

export function saveAuthForScheme(
  serviceId: string | undefined,
  schemeName: string,
  scheme: {
    type?: string
    scheme?: string
    name?: string
    in?: string
  },
  values: Pick<AuthConfig, 'token' | 'apiKey'>
) {
  const kind = authKindFromSecurityScheme(scheme)
  const config: AuthConfig = {
    kind,
    ...inferAuthConfig({ [schemeName]: scheme }, schemeName),
    ...values,
  }
  const key = getTryItAuthStorageKey(serviceId, kind, schemeName)
  localStorage.setItem(key, JSON.stringify(config))
  const legacyKey = getLegacyTryItAuthStorageKey(serviceId, kind)
  localStorage.setItem(legacyKey, JSON.stringify(config))
  window.dispatchEvent(
    new CustomEvent('tryit-auth-changed', {
      detail: { key, legacyKey },
    })
  )
}

export function clearAuthForScheme(
  serviceId: string | undefined,
  schemeName: string,
  scheme: {
    type?: string
    scheme?: string
    name?: string
    in?: string
  }
) {
  saveAuthForScheme(serviceId, schemeName, scheme, { token: '', apiKey: '' })
}

export function isSchemeAuthorized(
  scheme: { type?: string; scheme?: string },
  config: AuthConfig
): boolean {
  const kind = authKindFromSecurityScheme(scheme)
  if (kind === 'bearer' || kind === 'oauth2') {
    return Boolean(config.token?.trim())
  }
  if (kind === 'api-key') {
    return Boolean(config.apiKey?.trim())
  }
  return false
}

export function useTryItAuthConfig(
  serviceId: string | undefined,
  authKind: AuthKind,
  securityScheme?: {
    type?: string
    scheme?: string
    name?: string
    in?: string
  } | null,
  schemeName?: string
) {
  const [authConfig, setAuthConfig] = useState<AuthConfig>(() => ({
    kind: authKind,
    ...inferAuthConfig(
      securityScheme && schemeName ? { [schemeName]: securityScheme } : {},
      schemeName
    ),
  }))

  useEffect(() => {
    setAuthConfig((prev) => ({
      ...prev,
      kind: authKind,
      ...inferAuthConfig(
        securityScheme && schemeName ? { [schemeName]: securityScheme } : {},
        schemeName
      ),
    }))
  }, [authKind, schemeName, securityScheme])

  const reloadFromStorage = useCallback(() => {
    const keys = [
      getTryItAuthStorageKey(serviceId, authKind, schemeName),
      getLegacyTryItAuthStorageKey(serviceId, authKind),
    ]
    for (const key of keys) {
      const stored = localStorage.getItem(key)
      if (!stored) continue
      try {
        const parsed = JSON.parse(stored) as AuthConfig
        setAuthConfig((prev) => ({ ...prev, ...parsed, kind: authKind }))
        return
      } catch {
        // ignore invalid storage
      }
    }
  }, [authKind, schemeName, serviceId])

  useEffect(() => {
    reloadFromStorage()
  }, [reloadFromStorage])

  useEffect(() => {
    function handleAuthChanged(event: Event) {
      const keys = [
        getTryItAuthStorageKey(serviceId, authKind, schemeName),
        getLegacyTryItAuthStorageKey(serviceId, authKind),
      ]
      const detail = (event as CustomEvent<{ key?: string }>).detail
      if (!detail?.key || keys.includes(detail.key)) {
        reloadFromStorage()
      }
    }
    window.addEventListener('tryit-auth-changed', handleAuthChanged)
    return () =>
      window.removeEventListener('tryit-auth-changed', handleAuthChanged)
  }, [authKind, reloadFromStorage, schemeName, serviceId])

  const saveAuthConfig = useCallback(
    (config: AuthConfig) => {
      setAuthConfig(config)
      const key = getTryItAuthStorageKey(serviceId, config.kind, schemeName)
      localStorage.setItem(key, JSON.stringify(config))
      window.dispatchEvent(
        new CustomEvent('tryit-auth-changed', { detail: { key } })
      )
    },
    [schemeName, serviceId]
  )

  const clearAuthConfig = useCallback(() => {
    const cleared: AuthConfig = {
      kind: authKind,
      ...inferAuthConfig(
        securityScheme && schemeName ? { [schemeName]: securityScheme } : {},
        schemeName
      ),
    }
    saveAuthConfig(cleared)
  }, [authKind, saveAuthConfig, schemeName, securityScheme])

  const isAuthorized =
    authKind === 'none' ||
    (authKind === 'bearer' || authKind === 'oauth2'
      ? Boolean(authConfig.token?.trim())
      : authKind === 'api-key'
        ? Boolean(authConfig.apiKey?.trim())
        : false)

  return { authConfig, saveAuthConfig, clearAuthConfig, isAuthorized }
}

export function formatSecuritySchemeLabel(
  name: string,
  scheme: { type?: string; scheme?: string }
): string {
  const type = (scheme.type || '').toLowerCase()
  const httpScheme = (scheme.scheme || '').toLowerCase()

  if (type === 'http' && httpScheme) {
    return `${name} (http, ${capitalize(httpScheme)})`
  }
  if (type === 'oauth2') return `${name} (oauth2)`
  if (type === 'apikey') return `${name} (apiKey)`
  return name
}

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function authKindFromSecurityScheme(scheme?: {
  type?: string
  scheme?: string
}): AuthKind {
  if (!scheme) return 'other'
  const type = (scheme.type || '').toLowerCase()
  const httpScheme = (scheme.scheme || '').toLowerCase()
  if (type === 'oauth2') return 'oauth2'
  if (type === 'apikey') return 'api-key'
  if (type === 'http' && httpScheme === 'bearer') return 'bearer'
  return 'other'
}
