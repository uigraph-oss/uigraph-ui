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

export function EvaluationModal({
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
      title="New evaluation"
      description="Record a benchmark or test run against this version."
      footer={
        <div className="flex justify-end gap-2">
          <Button preset="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button preset="primary" onClick={() => onOpenChange(false)}>
            Create evaluation
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <FormField label="Name">
          <Input placeholder="Cold-start offline benchmark" />
        </FormField>

        <FormGrid>
          <FormField label="Type">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Offline Benchmark">
                  Offline Benchmark
                </SelectItem>
                <SelectItem value="Online A/B Test">Online A/B Test</SelectItem>
                <SelectItem value="Human Review">Human Review</SelectItem>
                <SelectItem value="Production Monitoring">
                  Production Monitoring
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Evaluator">
            <Input placeholder="Maya Patel" />
          </FormField>
        </FormGrid>

        <FormField label="Description">
          <Textarea placeholder="What was evaluated and how?" rows={3} />
        </FormField>

        <FormField label="Summary" hint="Headline result.">
          <Textarea placeholder="Watch time up 12% vs v1." rows={2} />
        </FormField>
      </div>
    </SimpleModal>
  )
}
