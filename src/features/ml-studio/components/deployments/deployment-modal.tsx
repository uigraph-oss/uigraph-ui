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
import { FormField, FormGrid } from '../form-field'
import { ModelVersionSelect } from '../model-version-select'

export function DeploymentModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="New deployment"
        description="Roll this version out to a serving environment."
        footerCancel
        footerSubmit="Create deployment"
        onFooterSubmitClick={() => onOpenChange(false)}
      >
        <div className="flex flex-col gap-5">
          <ModelVersionSelect />

          <FormGrid>
            <FormField label="Name">
              <Input placeholder="rec-prod-us" />
            </FormField>
            <FormField label="Environment">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="canary">Canary</SelectItem>
                  <SelectItem value="shadow">Shadow</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGrid>

          <FormGrid>
            <FormField label="Status">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="rolling-out">Rolling out</SelectItem>
                  <SelectItem value="rolled-back">Rolled back</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Region">
              <Input placeholder="us-east-1" />
            </FormField>
          </FormGrid>

          <FormField label="Endpoint">
            <Input placeholder="https://infer.internal/rec/v3" />
          </FormField>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
