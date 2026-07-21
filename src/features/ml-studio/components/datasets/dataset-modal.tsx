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

export function DatasetModal({
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
      title="Register dataset"
      description="Reference a data source used to train or evaluate this version."
      footer={
        <div className="flex justify-end gap-2">
          <Button preset="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button preset="primary" onClick={() => onOpenChange(false)}>
            Register dataset
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <ModelVersionSelect />

        <FormGrid>
          <FormField label="Name">
            <Input placeholder="video-watch-events" />
          </FormField>
          <FormField label="Version">
            <Input placeholder="v3.0.0" />
          </FormField>
        </FormGrid>

        <FormField label="Description">
          <Textarea placeholder="What does this dataset contain?" rows={3} />
        </FormField>

        <FormGrid>
          <FormField label="Type">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tabular">Tabular</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="multimodal">Multimodal</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="License">
            <Input placeholder="Internal" />
          </FormField>
        </FormGrid>

        <FormGrid>
          <FormField label="Row count">
            <Input placeholder="48000000" />
          </FormField>
          <FormField label="Size">
            <Input placeholder="18 GB" />
          </FormField>
        </FormGrid>

        <FormField label="Source" hint="Storage location or URI.">
          <Input placeholder="s3://data-lake/video/watch-events/v2" />
        </FormField>

        <FormField label="Parent dataset" hint="For lineage tracking.">
          <Input placeholder="video-watch-events v1.0.0" />
        </FormField>

        <FormField label="Tags" hint="Comma separated">
          <Input placeholder="augmented, pii" />
        </FormField>
      </div>
    </SimpleModal>
  )
}
