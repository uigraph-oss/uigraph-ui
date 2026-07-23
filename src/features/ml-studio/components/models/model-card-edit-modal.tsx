'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { UPDATE_ML_MODEL } from '../../api/ml-studio'
import { Model } from '../../types'

export function ModelCardEditModal({
  model,
  open,
  onOpenChange,
}: {
  model: Model
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const orgId = useCurrentOrganization()?.id
  const [updateModel] = useMutation(UPDATE_ML_MODEL, {
    refetchQueries: ['MlStudioModel', 'MlStudioModels'],
    awaitRefetchQueries: true,
  })

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
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">
                Problem type
              </Label>
              <Select value={problemType} onValueChange={setProblemType}>
                <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 text-sm">
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
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">
                Domain
              </Label>
              <Input
                placeholder="Recommendations"
                autoComplete="off"
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">
                Owners
              </Label>
              <Input
                placeholder="Maya Patel, Ranking team"
                autoComplete="off"
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                value={owners}
                onChange={(e) => setOwners(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">
                License
              </Label>
              <Input
                placeholder="Apache-2.0"
                autoComplete="off"
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Intended use
            </Label>
            <Textarea
              placeholder="Who should use this model and for what?"
              className="min-h-[98px] resize-none rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3"
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Limitations
            </Label>
            <Textarea
              placeholder="Where does this model fail or fall out of scope?"
              className="min-h-[98px] resize-none rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Ethical considerations
            </Label>
            <Textarea
              placeholder="Risks, sensitive data, fairness concerns."
              className="min-h-[98px] resize-none rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3"
              value={ethicalConsiderations}
              onChange={(e) => setEthicalConsiderations(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Caveats & recommendations
            </Label>
            <Textarea
              placeholder="Guidance for responsible use."
              className="min-h-[98px] resize-none rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3"
              value={caveats}
              onChange={(e) => setCaveats(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              References
            </Label>
            <p className="text-sm text-[#828DA3]">
              One link or citation per line
            </p>
            <Textarea
              placeholder={'https://docs.internal/model\nSmith et al. 2024'}
              className="min-h-[98px] resize-none rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3"
              value={references}
              onChange={(e) => setReferences(e.target.value)}
            />
          </div>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
