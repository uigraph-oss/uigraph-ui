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

export function ModelModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="New Model"
        description="Register a model in the studio. You can add versions and experiments after."
        footerCancel
        footerSubmit="Create model"
        onFooterSubmitClick={() => onOpenChange(false)}
      >
        <div className="flex flex-col gap-5">
          <FormField label="Name">
            <Input placeholder="Video Recommendations" />
          </FormField>

          <FormField label="Description">
            <Textarea placeholder="What does this model do?" rows={3} />
          </FormField>

          <FormGrid>
            <FormField label="Owner">
              <Input placeholder="Maya Patel" />
            </FormField>
            <FormField label="Domain">
              <Input placeholder="Recommendations" />
            </FormField>
          </FormGrid>

          <FormGrid>
            <FormField label="Problem type">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="ranking">Ranking</SelectItem>
                  <SelectItem value="generation">Generation</SelectItem>
                  <SelectItem value="embedding">Embedding</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGrid>

          <FormField label="Tags" hint="Comma separated">
            <Input placeholder="ranking, cold-start, retrieval" />
          </FormField>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
