'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '../form-field'
import { ModelVersionSelect } from '../model-version-select'

export function FindingModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="New finding"
        description="Capture what was learned from an experiment."
        footerCancel
        footerSubmit="Create finding"
        onFooterSubmitClick={() => onOpenChange(false)}
      >
        <div className="flex flex-col gap-5">
          <FormField label="Title" hint="A short summary of the insight.">
            <Input placeholder="Two-tower architecture improves cold-start recommendations" />
          </FormField>

          <FormField label="Body" hint="The explanation of the insight.">
            <Textarea
              placeholder="What did we discover, why did it happen, and why does it matter?"
              rows={5}
            />
          </FormField>

          <FormField label="Evidence" hint="Comma separated run IDs.">
            <Input placeholder="r-vr-v2-a, r-vr-v2-b" />
          </FormField>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-[#F4F7FC]">
                Supports → Model Version
              </span>
              <span className="text-xs text-[#828DA3]">
                The model version this finding justifies (optional).
              </span>
            </div>
            <ModelVersionSelect />
          </div>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
