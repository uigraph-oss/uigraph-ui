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
import { useEffect, useState } from 'react'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { Model } from '../../types'
import { FormField, FormGrid } from '../form-field'

export function ModelCardEditModal({
  model,
  open,
  onOpenChange,
}: {
  model: Model
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { orgId, updateModel } = useMlStudioData()

  const [domain, setDomain] = useState('')
  const [problemType, setProblemType] = useState('')
  const [owners, setOwners] = useState('')
  const [license, setLicense] = useState('')
  const [references, setReferences] = useState('')
  const [intendedUse, setIntendedUse] = useState('')
  const [limitations, setLimitations] = useState('')
  const [ethicalConsiderations, setEthicalConsiderations] = useState('')
  const [caveats, setCaveats] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    setDomain(model.domain)
    setProblemType(model.problemType)
    setOwners(model.owners)
    setLicense(model.license)
    setReferences(model.references.join('\n'))
    setIntendedUse(model.intendedUse)
    setLimitations(model.limitations)
    setEthicalConsiderations(model.ethicalConsiderations)
    setCaveats(model.caveats)
  }, [open, model])

  async function submit() {
    if (!orgId) {
      return
    }
    setSaving(true)
    try {
      await updateModel({
        variables: {
          orgId,
          id: model.id,
          domain,
          problemType,
          owners,
          license,
          references: references
            .split('\n')
            .map((r) => r.trim())
            .filter(Boolean),
          intendedUse,
          limitations,
          ethicalConsiderations,
          caveats,
        },
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="Edit model card"
        description="Document how this model should be understood and used."
        footerCancel
        footerSubmit="Save changes"
        footerSubmitLoading={saving}
        onFooterSubmitClick={submit}
      >
        <div className="flex flex-col gap-4">
          <FormGrid>
            <FormField label="Problem type">
              <Select value={problemType} onValueChange={setProblemType}>
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
            <FormField label="Domain">
              <Input
                placeholder="Recommendations"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </FormField>
          </FormGrid>

          <FormGrid>
            <FormField label="Owners">
              <Input
                placeholder="Maya Patel, Ranking team"
                value={owners}
                onChange={(e) => setOwners(e.target.value)}
              />
            </FormField>
            <FormField label="License">
              <Input
                placeholder="Apache-2.0"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
              />
            </FormField>
          </FormGrid>

          <FormField label="Intended use">
            <Textarea
              placeholder="Who should use this model and for what?"
              rows={2}
              className="min-h-[3.5rem]"
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
            />
          </FormField>

          <FormField label="Limitations">
            <Textarea
              placeholder="Where does this model fail or fall out of scope?"
              rows={2}
              className="min-h-[3.5rem]"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
            />
          </FormField>

          <FormField label="Ethical considerations">
            <Textarea
              placeholder="Risks, sensitive data, fairness concerns."
              rows={2}
              className="min-h-[3.5rem]"
              value={ethicalConsiderations}
              onChange={(e) => setEthicalConsiderations(e.target.value)}
            />
          </FormField>

          <FormField label="Caveats & recommendations">
            <Textarea
              placeholder="Guidance for responsible use."
              rows={2}
              className="min-h-[3.5rem]"
              value={caveats}
              onChange={(e) => setCaveats(e.target.value)}
            />
          </FormField>

          <FormField label="References" hint="One link or citation per line">
            <Textarea
              placeholder={'https://docs.internal/model\nSmith et al. 2024'}
              rows={2}
              className="min-h-[3.5rem]"
              value={references}
              onChange={(e) => setReferences(e.target.value)}
            />
          </FormField>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
