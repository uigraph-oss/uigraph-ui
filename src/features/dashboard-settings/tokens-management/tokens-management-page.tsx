'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOrganizationContext } from '@/contexts'
import { useMutation } from '@apollo/client'
import { Check, Copy, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_TOKEN,
  LIST_TOKENS,
  REVOKE_TOKEN,
  ROTATE_TOKEN,
} from '../api/tokens'
import { SettingsHeader } from '../components/settings-header'
import { CreateTokenModal } from './create-token-modal'
import { TokensList } from './tokens-list'

export function TokensManagementPage() {
  const { organizationId } = useOrganizationContext()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newToken, setNewToken] = useState<{
    tokenId: string
    plaintext: string
    name: string
  } | null>(null)

  const [createToken] = useMutation(CREATE_TOKEN, {
    refetchQueries: [{ query: LIST_TOKENS, variables: { organizationId } }],
  })

  const [revokeToken] = useMutation(REVOKE_TOKEN, {
    refetchQueries: [{ query: LIST_TOKENS, variables: { organizationId } }],
  })

  const [rotateToken] = useMutation(ROTATE_TOKEN, {
    refetchQueries: [{ query: LIST_TOKENS, variables: { organizationId } }],
  })

  async function handleCreateToken(values: {
    name: string
    expiresAt?: string
  }) {
    try {
      const expiresAt = values.expiresAt
        ? new Date(values.expiresAt).toISOString()
        : undefined

      const result = await createToken({
        variables: {
          organizationId,
          input: {
            name: values.name,
            expiresAt,
          },
        },
      })

      if (result.data?.CreateToken) {
        setNewToken({
          tokenId: result.data.CreateToken.tokenId!,
          plaintext: result.data.CreateToken.plaintext!,
          name: result.data.CreateToken.name!,
        })
        setIsCreateModalOpen(false)
        toast.success('Token created successfully')
      }
    } catch (error) {
      toast.error('Failed to create token')
      console.error(error)
    }
  }

  async function handleRevokeToken(tokenId: string) {
    try {
      await revokeToken({
        variables: {
          organizationId,
          tokenId,
        },
      })
      toast.success('Token revoked successfully')
    } catch (error) {
      toast.error('Failed to revoke token')
      console.error(error)
    }
  }

  async function handleRotateToken(
    tokenId: string
  ): Promise<{ plaintext: string } | null> {
    try {
      const result = await rotateToken({
        variables: {
          organizationId,
          tokenId,
        },
      })

      if (result.data?.RotateToken?.plaintext) {
        return { plaintext: result.data.RotateToken.plaintext }
      }
      return null
    } catch (error) {
      toast.error('Failed to rotate token')
      console.error(error)
      return null
    }
  }

  return (
    <>
      <SettingsHeader
        title="API Token Management"
        description="Create and manage API tokens for programmatic access"
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Create Token
          </Button>
        }
      />

      <TokensList onRevoke={handleRevokeToken} onRotate={handleRotateToken} />

      <BetterDialogProvider
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <CreateTokenModal
          onSubmit={handleCreateToken}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={!!newToken}
        onOpenChange={(open) => {
          if (!open) setNewToken(null)
        }}
      >
        {newToken && (
          <CreateTokenSuccessModal
            token={newToken}
            onClose={() => setNewToken(null)}
          />
        )}
      </BetterDialogProvider>
    </>
  )
}

function CreateTokenSuccessModal({
  token,
}: {
  token: { tokenId: string; plaintext: string; name: string }
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(token.plaintext)
    setCopied(true)
    toast.success('Token copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BetterDialogContent
      title="Token Created Successfully"
      description="Make sure to copy your token now. You won't be able to see it again."
      footerCancel
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#111110]">
            Token Name
          </Label>
          <Input
            value={token.name}
            readOnly
            className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-gray-50 px-6"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#111110]">
            API Token
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={token.plaintext}
              readOnly
              className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-gray-50 px-6 font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-[56px] w-[56px]"
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            ⚠️ This is the only time you&apos;ll see this token. Make sure to
            copy it now.
          </p>
        </div>
      </div>
    </BetterDialogContent>
  )
}
