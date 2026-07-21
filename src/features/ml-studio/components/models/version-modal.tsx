'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormGrid } from '../form-field'

export function VersionModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="Create version"
        description="Promote a run into a new named version of this model."
        footerCancel
        footerSubmit="Create version"
        onFooterSubmitClick={() => onOpenChange(false)}
      >
        <div className="flex flex-col gap-5">
          <FormGrid>
            <FormField label="Version">
              <Input placeholder="v4.0.0" />
            </FormField>
            <FormField label="Display name">
              <Input placeholder="Video Recs v3" />
            </FormField>
          </FormGrid>

          <FormField label="Description">
            <Textarea placeholder="What changed in this version?" rows={3} />
          </FormField>

          <FormGrid>
            <FormField label="Status">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Stage">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGrid>

          <FormField label="Linked run">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a run to promote" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="r-vr-v2-b">
                  r-vr-v2-b · watch-history-context
                </SelectItem>
                <SelectItem value="r-vr-v2-a">
                  r-vr-v2-a · feed-baseline
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Release notes">
            <Textarea
              placeholder="Highlights, metrics, and caveats."
              rows={4}
            />
          </FormField>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
