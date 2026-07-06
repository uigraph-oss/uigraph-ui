'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { format } from 'date-fns'
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  Copy,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CREATE_TOKEN,
  DELETE_SERVICE_ACCOUNT,
  REVOKE_TOKEN,
  SERVICE_ACCOUNT_SCOPES,
  SERVICE_ACCOUNT_TOKENS,
  SERVICE_ACCOUNTS,
  UPDATE_SERVICE_ACCOUNT,
  type ServiceAccount,
  type ServiceAccountToken,
} from './api'
import {
  ServiceAccountModal,
  type ServiceAccountFormValues,
} from './service-account-modal'

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

export function ServiceAccountDetailPage() {
  const orgId = useCurrentOrganization()?.id as string
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addKeyOpen, setAddKeyOpen] = useState(false)
  const [revokeTokenId, setRevokeTokenId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [created, setCreated] = useState<{ token: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const accountsQuery = useQuery(SERVICE_ACCOUNTS, {
    variables: { orgId },
    skip: !orgId,
    onError: (error) => toast.error(error.message),
  })
  const scopesQuery = useQuery(SERVICE_ACCOUNT_SCOPES, {
    variables: { orgId },
    skip: !orgId,
    onError: (error) => toast.error(error.message),
  })
  const tokensQuery = useQuery(SERVICE_ACCOUNT_TOKENS, {
    variables: { orgId, saId: id as string },
    skip: !orgId || !id,
    onError: (error) => toast.error(error.message),
  })

  const accounts = (accountsQuery.data?.serviceAccounts ??
    []) as ServiceAccount[]
  const account = accounts.find((a) => a.id === id)
  const scopes = scopesQuery.data?.serviceAccountScopes ?? []
  const tokens = (tokensQuery.data?.serviceAccountTokens ??
    []) as ServiceAccountToken[]

  const refetchAccounts = {
    refetchQueries: [{ query: SERVICE_ACCOUNTS, variables: { orgId } }],
    awaitRefetchQueries: true,
  }
  const refetchTokens = {
    refetchQueries: [
      { query: SERVICE_ACCOUNT_TOKENS, variables: { orgId, saId: id } },
    ],
    awaitRefetchQueries: true,
  }
  const [updateServiceAccount] = useMutation(
    UPDATE_SERVICE_ACCOUNT,
    refetchAccounts
  )
  const [deleteServiceAccount] = useMutation(
    DELETE_SERVICE_ACCOUNT,
    refetchAccounts
  )
  const [createToken, { loading: creating }] = useMutation(
    CREATE_TOKEN,
    refetchTokens
  )
  const [revokeToken] = useMutation(REVOKE_TOKEN, refetchTokens)

  async function handleEdit(values: ServiceAccountFormValues) {
    if (!account) return
    try {
      await updateServiceAccount({
        variables: {
          orgId,
          id: account.id,
          input: { ...values, disabled: account.disabled },
        },
      })
      setEditOpen(false)
      toast.success('Service account updated')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleDelete() {
    if (!account) return
    try {
      await deleteServiceAccount({ variables: { orgId, id: account.id } })
      toast.success('Service account deleted')
      await navigate('/settings/service-accounts')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleCreateToken() {
    if (name.trim() === '') {
      toast.error('Token name is required')
      return
    }
    try {
      const { data } = await createToken({
        variables: {
          orgId,
          saId: id as string,
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

  async function handleRevoke() {
    if (!revokeTokenId) return
    try {
      await revokeToken({
        variables: { orgId, saId: id as string, tokenId: revokeTokenId },
      })
      setRevokeTokenId(null)
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

  function closeAddKey() {
    setAddKeyOpen(false)
    setName('')
    setExpiresAt('')
    setCreated(null)
    setCopied(false)
  }

  if (accountsQuery.loading && !accountsQuery.data) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>
    )
  }

  if (!account) {
    return (
      <div className="px-6 pt-6">
        <button
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#A0AABB] transition-colors hover:text-[#F4F7FC]"
          onClick={() => navigate('/settings/service-accounts')}
        >
          <ArrowLeft className="size-4" />
          Back to Service Accounts
        </button>
        <p className="text-muted-foreground text-sm">
          Service account not found.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 p-6">
        <Button
          preset="outline"
          onClick={() => navigate('/settings/service-accounts')}
        >
          <ArrowLeft className="size-4" />
          Back to Service Accounts
        </Button>

        <div className="bg-card rounded-[12px] border border-[#2A3242] p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16 shrink-0 rounded-2xl bg-[#1E2533]">
                <AvatarFallback className="rounded-2xl text-lg font-bold text-[#A0AABB]">
                  {account.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="truncate text-lg font-semibold text-[#F4F7FC]">
                    {account.name}
                  </h2>
                  <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#586378]">
                    <ShieldCheck className="size-3.5" />
                    {account.scopes.length}{' '}
                    {account.scopes.length === 1 ? 'permission' : 'permissions'}
                  </div>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-[#828DA3]">
                  {account.description || 'No description'}
                </p>
              </div>
            </div>
            {!account.isInternal && (
              <div className="flex shrink-0 items-center gap-[10px]">
                <Button preset="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  preset="outline"
                  className="border-red-500/30 text-red-500 hover:border-red-500/40 hover:bg-red-500/10"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#F4F7FC]">
                API Keys
              </h3>
              <p className="text-paragraph mt-1 text-sm">
                Create and revoke API tokens. A token inherits the service
                account&apos;s permissions.
              </p>
            </div>
            {!account.isInternal && (
              <Button onClick={() => setAddKeyOpen(true)}>
                <Plus className="size-4" />
                Add API Key
              </Button>
            )}
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
                    <td className="px-4 py-3">
                      {!token.revoked && !account.isInternal && (
                        <div className="flex justify-end">
                          <button
                            className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
                            onClick={() => setRevokeTokenId(token.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BetterDialogProvider
        open={editOpen}
        onOpenChange={(open) => !open && setEditOpen(false)}
      >
        <ServiceAccountModal
          account={account}
          availableScopes={scopes}
          onSubmit={handleEdit}
        />
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Service Account?"
        description="This permanently revokes all of its tokens. This action cannot be undone."
        deleteButtonText="Delete"
        cancelButtonText="Cancel"
      />

      <BetterDeleteConfirmationModal
        open={revokeTokenId !== null}
        onOpenChange={(open) => !open && setRevokeTokenId(null)}
        onConfirm={handleRevoke}
        title="Revoke API Key?"
        description="This permanently revokes the token. Any client using it will stop working. This action cannot be undone."
        deleteButtonText="Revoke"
        cancelButtonText="Cancel"
      />

      <BetterDialogProvider
        open={addKeyOpen}
        onOpenChange={(open) => !open && closeAddKey()}
        className="sm:max-w-[32rem]"
      >
        <BetterDialogContent
          title="Add API Key"
          description={created ? undefined : 'Set a name and optional expiry.'}
          footerCancel={created ? 'Done' : 'Cancel'}
          footerSubmit={created ? undefined : 'Create API Key'}
          footerSubmitIcon={<Plus className="h-4 w-4" />}
          footerSubmitLoading={creating}
          onFooterSubmitClick={handleCreateToken}
        >
          {created ? (
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
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
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
                      className="flex h-11 w-full items-center justify-between gap-2 rounded-[12px] border border-[#2A3242] bg-transparent px-4 text-sm transition-colors hover:border-[#3A4254]"
                    >
                      <span
                        className={
                          expiresAt ? 'text-[#D2D9E6]' : 'text-[#586378]'
                        }
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
                  <PopoverContent className="w-auto p-0" align="start">
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
            </div>
          )}
        </BetterDialogContent>
      </BetterDialogProvider>
    </>
  )
}
