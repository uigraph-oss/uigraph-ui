'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { FormField } from '../form-field'
import { ModelVersionSelect } from '../model-version-select'

export function FindingModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { orgId, createFinding } = useMlStudioData()
  const [modelId, setModelId] = useState('')
  const [versionId, setVersionId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState('')

  async function submit() {
    if (!orgId || !modelId || !title) {
      return
    }
    const runIds = evidence
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    await createFinding({
      variables: {
        orgId,
        input: {
          modelId,
          versionId: versionId || null,
          title,
          description,
          runIds,
        },
      },
    })
    onOpenChange(false)
  }

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="New finding"
        description="Capture what was learned from an experiment."
        footerCancel
        footerSubmit="Create finding"
        onFooterSubmitClick={submit}
      >
        <div className="flex flex-col gap-5">
          <FormField label="Title" hint="A short summary of the insight.">
            <Input
              placeholder="Two-tower architecture improves cold-start recommendations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          <FormField label="Body" hint="The explanation of the insight.">
            <Textarea
              placeholder="What did we discover, why did it happen, and why does it matter?"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <FormField label="Evidence" hint="Comma separated run IDs.">
            <Input
              placeholder="r-vr-v2-a, r-vr-v2-b"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
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
            <ModelVersionSelect
              modelId={modelId}
              versionId={versionId}
              onModelChange={setModelId}
              onVersionChange={setVersionId}
            />
          </div>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
