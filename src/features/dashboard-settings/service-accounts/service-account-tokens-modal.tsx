'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQuery } from '@apollo/client'
import { Check, Copy, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_TOKEN,
  REVOKE_TOKEN,
  SERVICE_ACCOUNT_TOKENS,
  type ServiceAccount,
  type ServiceAccountToken,
} from './api'

function formatDate(value?: string | null) {
  if (!value) return 'Never'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
}

export function ServiceAccountTokensModal({
  orgId,
  account,
}: {
  orgId: string
  account: ServiceAccount
}) {
  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [created, setCreated] = useState<{ token: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const tokensQuery = useQuery(SERVICE_ACCOUNT_TOKENS, {
    variables: { orgId, saId: account.id },
    onError: (error) => toast.error(error.message),
  })
  const tokens = (tokensQuery.data?.serviceAccountTokens ??
    []) as ServiceAccountToken[]

  const refetchTokens = {
    refetchQueries: [
      { query: SERVICE_ACCOUNT_TOKENS, variables: { orgId, saId: account.id } },
    ],
    awaitRefetchQueries: true,
  }
  const [createToken, { loading: creating }] = useMutation(
    CREATE_TOKEN,
    refetchTokens
  )
  const [revokeToken] = useMutation(REVOKE_TOKEN, refetchTokens)

  async function handleCreate() {
    if (name.trim() === '') {
      toast.error('Token name is required')
      return
    }
    try {
      const { data } = await createToken({
        variables: {
          orgId,
          saId: account.id,
          input: {
            name: name.trim(),
            expiresAt: expiresAt
              ? new Date(expiresAt).toISOString()
              : undefined,
          },
        },
      })
      setCreated({ token: data!.createServiceAccountToken.token })
      setName('')
      setExpiresAt('')
      toast.success('Token created')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleRevoke(tokenId: string) {
    try {
      await revokeToken({ variables: { orgId, saId: account.id, tokenId } })
      toast.success('Token revoked')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleCopy() {
    if (!created) return
    await navigator.clipboard.writeText(created.token)
    setCopied(true)
    toast.success('Token copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BetterDialogContent
      title={`Tokens — ${account.name}`}
      description="Create and revoke API tokens. A token inherits the service account's permissions."
      footerCancel="Close"
    >
      <div className="space-y-6">
        {created && (
          <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Label className="text-sm font-medium text-amber-900">
              New token (copy it now — it won&apos;t be shown again)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={created.token}
                readOnly
                className="h-11 rounded-[12px] border border-amber-200 bg-white px-4 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="token-name" className="text-sm font-medium">
              Token Name
            </Label>
            <Input
              id="token-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., deploy-bot"
              className="h-11 rounded-[12px] border border-[#E5E7E9] bg-white px-4"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token-expires" className="text-sm font-medium">
              Expires (Optional)
            </Label>
            <Input
              id="token-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="h-11 rounded-[12px] border border-[#E5E7E9] bg-white px-4"
            />
          </div>
          <Button
            type="button"
            className="h-11 rounded-[12px]"
            disabled={creating}
            onClick={handleCreate}
          >
            <Plus className="mr-1 h-4 w-4" />
            Create
          </Button>
        </div>

        <div className="rounded-lg border border-[#E5E7E9]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Prefix</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Last Used</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tokens.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No tokens yet
                  </td>
                </tr>
              )}
              {tokens.map((token) => (
                <tr key={token.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {token.name}
                    {token.revoked && (
                      <span className="ml-2 text-xs text-red-600">
                        (revoked)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-600">
                      {token.prefix}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(token.expiresAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(token.lastUsedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!token.revoked && (
                      <button
                        className="flex size-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                        onClick={() => handleRevoke(token.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BetterDialogContent>
  )
}
