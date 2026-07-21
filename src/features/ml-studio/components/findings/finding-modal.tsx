'use client'

import { SimpleModal } from '@/components/simple-modal'
import { Button } from '@/components/ui/button'
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
import { ModelVersionSelect } from '../model-version-select'

export function FindingModal({
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
      title="New finding"
      description="Capture an insight or observation about this version."
      footer={
        <div className="flex justify-end gap-2">
          <Button preset="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button preset="primary" onClick={() => onOpenChange(false)}>
            Create finding
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <ModelVersionSelect />

        <FormField label="Title">
          <Input placeholder="Session context lifts watch time" />
        </FormField>

        <FormField label="Summary" hint="One-line takeaway.">
          <Textarea
            placeholder="Average watch time up 12% for new viewers."
            rows={2}
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            placeholder="Evidence, context, and recommendation."
            rows={4}
          />
        </FormField>

        <FormGrid>
          <FormField label="Severity">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="superseded">Superseded</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>

        <FormGrid>
          <FormField label="Source">
            <Input placeholder="Experiment analysis" />
          </FormField>
          <FormField label="Author">
            <Input placeholder="Maya Patel" />
          </FormField>
        </FormGrid>

        <FormField label="Linked runs" hint="Comma separated run IDs.">
          <Input placeholder="r-vr-v2-a, r-vr-v2-b" />
        </FormField>
      </div>
    </SimpleModal>
  )
}
