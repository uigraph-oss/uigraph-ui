'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '../form-field'
import { ModelVersionSelect } from '../model-version-select'

export function DecisionModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="New decision"
        description="Record a decision made about this version."
        footerCancel
        footerSubmit="Create decision"
        onFooterSubmitClick={() => onOpenChange(false)}
      >
        <div className="flex flex-col gap-5">
          <ModelVersionSelect />

          <FormField label="Title">
            <Input placeholder="Promote Video Recs v2 to production" />
          </FormField>

          <FormField label="Decision" hint="What was decided.">
            <Textarea
              placeholder="Ship v2 to 100% of home-feed traffic."
              rows={2}
            />
          </FormField>

          <FormField label="Reason" hint="Why this decision was made.">
            <Textarea
              placeholder="+9% click-through rate and +12% watch time in the A/B test."
              rows={2}
            />
          </FormField>

          <FormField label="Impact" hint="Expected outcome.">
            <Textarea
              placeholder="Improved recommendations for new users."
              rows={2}
            />
          </FormField>

          <FormField label="Decision maker">
            <Input placeholder="Priya Nair" />
          </FormField>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
