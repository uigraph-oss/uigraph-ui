'use client'

import { SecretAuthInput } from '@/components/secret-auth-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  authKindFromSecurityScheme,
  clearAuthForScheme,
  formatSecuritySchemeLabel,
  isSchemeAuthorized,
  loadAuthForScheme,
  saveAuthForScheme,
  useTryItAuthConfig,
} from '@/hooks/use-try-it-auth'
import { useMemo, useState } from 'react'

type SecurityScheme = {
  type?: string
  scheme?: string
  name?: string
  in?: string
}

type AuthDraft = {
  token: string
  apiKey: string
}

export function useApiAuthorizeDialog(
  serviceId: string | undefined,
  securitySchemes: Record<string, SecurityScheme>
) {
  const [open, setOpen] = useState(false)
  const [authDrafts, setAuthDrafts] = useState<Record<string, AuthDraft>>({})

  const securityEntries = useMemo(
    () => Object.entries(securitySchemes),
    [securitySchemes]
  )

  const hasSecuritySchemes = securityEntries.length > 0

  const primaryScheme = securityEntries[0]
  const primarySchemeName = primaryScheme?.[0] ?? 'default'
  const primarySchemeDef = primaryScheme?.[1]
  const primaryAuthKind = authKindFromSecurityScheme(primarySchemeDef)

  const { isAuthorized } = useTryItAuthConfig(
    serviceId,
    primaryAuthKind,
    primarySchemeDef ?? null,
    primarySchemeName
  )

  function openDialog() {
    const nextDrafts: Record<string, AuthDraft> = {}
    for (const [name, scheme] of securityEntries) {
      const saved = loadAuthForScheme(serviceId, name, scheme)
      nextDrafts[name] = {
        token: saved.token ?? '',
        apiKey: saved.apiKey ?? '',
      }
    }
    setAuthDrafts(nextDrafts)
    setOpen(true)
  }

  function handleAuthorize() {
    for (const [name, scheme] of securityEntries) {
      const draft = authDrafts[name]
      if (!draft) continue
      saveAuthForScheme(serviceId, name, scheme, {
        token: draft.token,
        apiKey: draft.apiKey,
      })
    }
    setOpen(false)
  }

  function handleLogout() {
    for (const [name, scheme] of securityEntries) {
      clearAuthForScheme(serviceId, name, scheme)
    }
    setAuthDrafts({})
    setOpen(false)
  }

  function updateAuthDraft(
    schemeName: string,
    field: keyof AuthDraft,
    value: string
  ) {
    setAuthDrafts((prev) => ({
      ...prev,
      [schemeName]: {
        token: prev[schemeName]?.token ?? '',
        apiKey: prev[schemeName]?.apiKey ?? '',
        [field]: value,
      },
    }))
  }

  return {
    open,
    setOpen,
    openDialog,
    handleAuthorize,
    handleLogout,
    updateAuthDraft,
    authDrafts,
    securityEntries,
    hasSecuritySchemes,
    isAuthorized,
  }
}

type ApiAuthorizeDialogProps = ReturnType<typeof useApiAuthorizeDialog> & {
  serviceId?: string
}

export function ApiAuthorizeDialog({
  open,
  setOpen,
  handleAuthorize,
  handleLogout,
  updateAuthDraft,
  authDrafts,
  securityEntries,
  hasSecuritySchemes,
  isAuthorized,
  serviceId,
}: ApiAuthorizeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border-[#2A3242] bg-[#141925]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Available authorizations
          </DialogTitle>
        </DialogHeader>

        {hasSecuritySchemes ? (
          securityEntries.map(([name, scheme]) => {
            const label = formatSecuritySchemeLabel(name, scheme)
            const kind = authKindFromSecurityScheme(scheme)
            const saved = loadAuthForScheme(serviceId, name, scheme)
            const draft = authDrafts[name] ?? {
              token: saved.token ?? '',
              apiKey: saved.apiKey ?? '',
            }
            const schemeAuthorized = isSchemeAuthorized(scheme, saved)

            return (
              <div
                key={name}
                className="space-y-3 rounded-lg border border-[#2A3242] bg-[#1E2533] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[#F4F7FC]">
                    {label}
                  </div>
                  {schemeAuthorized ? (
                    <span className="text-xs text-emerald-400">Authorized</span>
                  ) : null}
                </div>

                {kind === 'api-key' ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-[#828DA3]">
                      Value
                      {scheme.name ? ` (${scheme.name})` : ''}:
                    </Label>
                    <SecretAuthInput
                      value={draft.apiKey}
                      onChange={(value) =>
                        updateAuthDraft(name, 'apiKey', value)
                      }
                      placeholder="API key value"
                      className="h-9 bg-[#141925]"
                    />
                    {scheme.in ? (
                      <p className="text-[11px] text-[#828DA3]">
                        Sent in {scheme.in === 'query' ? 'query' : 'header'}
                      </p>
                    ) : null}
                  </div>
                ) : kind === 'bearer' || kind === 'oauth2' ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-[#828DA3]">Value:</Label>
                    <SecretAuthInput
                      value={draft.token}
                      onChange={(value) =>
                        updateAuthDraft(name, 'token', value)
                      }
                      placeholder="Bearer token"
                      className="h-9 bg-[#141925]"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-[#828DA3]">
                    This authorization type is not supported yet.
                  </p>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-sm text-[#828DA3]">No authorization required.</p>
        )}

        <DialogFooter className="gap-2 sm:justify-end">
          {isAuthorized ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={handleAuthorize}
            disabled={!hasSecuritySchemes}
          >
            Authorize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
