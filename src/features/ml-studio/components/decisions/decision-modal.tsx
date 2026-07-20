'use client'

import { SimpleModal } from '@/components/simple-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '../form-field'

export function DecisionModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <SimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title="New decision"
      description="Record a decision made about this version."
      footer={
        <div className="flex justify-end gap-2">
          <Button preset="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button preset="primary" onClick={() => onOpenChange(false)}>
            Create decision
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
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
    </SimpleModal>
  )
}
