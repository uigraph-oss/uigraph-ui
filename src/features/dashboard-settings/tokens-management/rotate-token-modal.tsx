'use client'

import type { GT } from '@/api'
import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type RotateTokenModalProps = {
  token: GT.TokenListItem
  onClose: () => void
  onRotate: (tokenId: string) => Promise<{ plaintext: string } | null>
}

export function RotateTokenModal({ token, onRotate }: RotateTokenModalProps) {
  const [newToken, setNewToken] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleRotate() {
    setIsRotating(true)
    try {
      const result = await onRotate(token.tokenId!)
      if (result?.plaintext) {
        setNewToken(result.plaintext)
        toast.success('Token rotated successfully')
      }
    } catch {
      toast.error('Failed to rotate token')
    } finally {
      setIsRotating(false)
    }
  }

  async function handleCopy() {
    if (newToken) {
      await navigator.clipboard.writeText(newToken)
      setCopied(true)
      toast.success('Token copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (newToken) {
    return (
      <BetterDialogContent
        title="Token Rotated"
        description="Your token has been rotated. Make sure to copy it now as you won't be able to see it again."
        footerCancel
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#111110]">
              New Token
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={newToken}
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
            <p className="text-destructive text-xs">
              ⚠️ This is the only time you&apos;ll see this token. Make sure to
              copy it now.
            </p>
          </div>
        </div>
      </BetterDialogContent>
    )
  }

  return (
    <BetterDialogContent
      title="Rotate API Token"
      description="Rotating a token will invalidate the current token and create a new one. This action cannot be undone."
      footerSubmit="Rotate Token"
      footerSubmitLoading={isRotating}
      onFooterSubmitClick={handleRotate}
      footerCancel
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> The current token will be immediately
            revoked and a new token will be generated. Update all applications
            using this token.
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#111110]">
            Token Name
          </Label>
          <Input
            value={token.name || ''}
            readOnly
            className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-gray-50 px-6"
          />
        </div>
      </div>
    </BetterDialogContent>
  )
}
