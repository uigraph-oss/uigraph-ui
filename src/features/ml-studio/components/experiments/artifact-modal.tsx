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

export function ArtifactModal({
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
      title="Attach artifact"
      description="Reference a file produced by this run. UiGraph stores the pointer, not the file."
      footer={
        <div className="flex justify-end gap-2">
          <Button preset="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button preset="primary" onClick={() => onOpenChange(false)}>
            Attach
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <FormGrid>
          <FormField label="Name">
            <Input placeholder="confusion_matrix.png" />
          </FormField>
          <FormField label="Type">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Model checkpoint">
                  Model checkpoint
                </SelectItem>
                <SelectItem value="Confusion matrix">
                  Confusion matrix
                </SelectItem>
                <SelectItem value="Notebook">Notebook</SelectItem>
                <SelectItem value="Plot">Plot</SelectItem>
                <SelectItem value="ONNX">ONNX</SelectItem>
                <SelectItem value="GGUF">GGUF</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>

        <FormField label="URI">
          <Input placeholder="s3://uigraph/…" />
        </FormField>

        <FormGrid>
          <FormField label="Size">
            <Input placeholder="162 MB" />
          </FormField>
          <FormField label="Format">
            <Input placeholder="ONNX" />
          </FormField>
        </FormGrid>

        <FormField label="Description">
          <Textarea placeholder="What is this artifact?" rows={3} />
        </FormField>
      </div>
    </SimpleModal>
  )
}
