'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/features/component-meta/components/tag-input'
import { ComponentMetaThemeProvider } from '@/features/component-meta/theme'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { CREATE_ML_MODEL } from '../../api/ml-studio'
import { FormField, FormGrid } from '../form-field'

const fieldClassName =
  'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'

export function ModelModal({
  onClose,
  projectId,
}: {
  onClose: () => void
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
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

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
            tags,
          },
        },
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BetterDialogContent
      title="New Model"
      description="Register a model in the studio. You can add versions and experiments after."
      footerCancel
      footerSubmit="Create model"
      footerSubmitLoading={saving}
      onFooterSubmitClick={submit}
    >
      <ComponentMetaThemeProvider theme="modal">
        <div className="flex flex-col gap-5">
          <FormField label="Name">
            <Input
              placeholder="Video Recommendations"
              className={fieldClassName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              placeholder="What does this model do?"
              className="min-h-[6.75rem] w-full resize-none rounded-[16px] border border-[#2A3242] bg-transparent p-6 text-sm leading-normal focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <FormGrid>
            <FormField label="Domain">
              <Input
                placeholder="Recommendations"
                className={fieldClassName}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </FormField>
            <FormField label="Problem type">
              <Select value={problemType} onValueChange={setProblemType}>
                <SelectTrigger className="text-foreground/80 h-[56px] w-full rounded-[16px] border-[#2A3242] bg-transparent px-6">
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

          <FormField label="Tags" hint="Type and press Enter to add a tag">
            <TagInput
              placeholder="ranking, cold-start, retrieval"
              value={tags}
              onChange={setTags}
            />
          </FormField>
        </div>
      </ComponentMetaThemeProvider>
    </BetterDialogContent>
  )
}
