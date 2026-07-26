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
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { CREATE_ML_MODEL } from '../../api/ml-studio'
import { FormField, FormGrid } from '../form-field'

export function ModelModal({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}) {
  const orgId = useCurrentOrganization()?.id
  const [createModel] = useMutation(CREATE_ML_MODEL, {
    refetchQueries: ['MlStudioModels'],
    awaitRefetchQueries: true,
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState('')
  const [problemType, setProblemType] = useState('other')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    setName('')
    setDescription('')
    setDomain('')
    setProblemType('other')
    setTags('')
  }, [open])

  async function submit() {
    if (!orgId || !name.trim()) {
      return
    }
    setSaving(true)
    try {
      await createModel({
        variables: {
          orgId,
          input: {
            projectId,
            name: name.trim(),
            description,
            domain,
            problemType,
            tags: tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          },
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
        title="New Model"
        description="Register a model in the studio. You can add versions and experiments after."
        footerCancel
        footerSubmit="Create model"
        footerSubmitLoading={saving}
        onFooterSubmitClick={submit}
      >
        <div className="flex flex-col gap-5">
          <FormField label="Name">
            <Input
              placeholder="Video Recommendations"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              placeholder="What does this model do?"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <FormGrid>
            <FormField label="Domain">
              <Input
                placeholder="Recommendations"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </FormField>
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
          </FormGrid>

          <FormField label="Tags" hint="Comma separated">
            <Input
              placeholder="ranking, cold-start, retrieval"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </FormField>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}
