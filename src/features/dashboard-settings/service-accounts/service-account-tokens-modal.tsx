'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMutation, useQuery } from '@apollo/client'
import { format } from 'date-fns'
import { CalendarIcon, Check, Copy, Plus, Trash2, X } from 'lucide-react'
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
  const [datePickerOpen, setDatePickerOpen] = useState(false)
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
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <Label className="text-sm font-medium text-amber-300">
              New token (copy it now — it won&apos;t be shown again)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={created.token}
                readOnly
                className="h-11 rounded-[12px] border border-[#2A3242] bg-transparent px-4 font-mono text-xs text-[#D2D9E6]"
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
            <Label
              htmlFor="token-name"
              className="text-sm font-medium text-[#D2D9E6]"
            >
              Token Name
            </Label>
            <Input
              id="token-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., deploy-bot"
              className="h-11 rounded-[12px] border border-[#2A3242] bg-transparent px-4"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#D2D9E6]">
              Expires (Optional)
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-[220px] items-center justify-between gap-2 rounded-[12px] border border-[#2A3242] bg-transparent px-4 text-sm transition-colors hover:border-[#3A4254]"
                >
                  <span
                    className={expiresAt ? 'text-[#D2D9E6]' : 'text-[#586378]'}
                  >
                    {expiresAt
                      ? format(new Date(expiresAt), 'MMM d, yyyy')
                      : 'No expiry'}
                  </span>
                  {expiresAt ? (
                    <X
                      className="size-4 shrink-0 text-[#586378] transition-colors hover:text-[#D2D9E6]"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpiresAt('')
                      }}
                    />
                  ) : (
                    <CalendarIcon className="size-4 shrink-0 text-[#586378]" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={expiresAt ? new Date(expiresAt) : undefined}
                  onSelect={(date) => {
                    if (!date) return
                    setExpiresAt(date.toISOString())
                    setDatePickerOpen(false)
                  }}
                  disabled={{ before: new Date() }}
                  defaultMonth={expiresAt ? new Date(expiresAt) : undefined}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
              </PopoverContent>
            </Popover>
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

        <div className="rounded-lg border border-[#2A3242]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A3242] text-left text-xs text-[#586378]">
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
                    className="px-4 py-6 text-center text-[#586378]"
                  >
                    No tokens yet
                  </td>
                </tr>
              )}
              {tokens.map((token) => (
                <tr key={token.id} className="border-b border-[#2A3242]">
                  <td className="px-4 py-3 font-medium text-[#D2D9E6]">
                    {token.name}
                    {token.revoked && (
                      <span className="ml-2 text-xs text-red-500">
                        (revoked)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-[#2A3242] px-2 py-1 text-xs text-[#A0AABB]">
                      {token.prefix}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-[#828DA3]">
                    {formatDate(token.expiresAt)}
                  </td>
                  <td className="px-4 py-3 text-[#828DA3]">
                    {formatDate(token.lastUsedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!token.revoked && (
                      <button
                        className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
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
