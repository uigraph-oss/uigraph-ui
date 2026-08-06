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
import { useNavigate } from 'react-router-dom'
import { CREATE_ML_MODEL, UPDATE_ML_MODEL_INFO } from '../../api/models'
import type { Model } from '../../types'
import { FormField, FormGrid } from '../form-field'

const fieldClassName =
  'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'

export function ModelModal({
  onClose,
  projectId,
  model,
}: {
  onClose: () => void
  projectId: string
  model?: Model | null
}) {
  const orgId = useCurrentOrganization()?.id
  const navigate = useNavigate()
  const [createModel] = useMutation(CREATE_ML_MODEL, {
    refetchQueries: ['MlStudioModels'],
    awaitRefetchQueries: true,
  })
  const [updateModelInfo] = useMutation(UPDATE_ML_MODEL_INFO, {
    refetchQueries: ['MlStudioModels', 'MlStudioModel'],
    awaitRefetchQueries: true,
  })
  const isEdit = !!model

  const [name, setName] = useState(model?.name ?? '')
  const [description, setDescription] = useState(model?.description ?? '')
  const [domain, setDomain] = useState(model?.domain ?? '')
  const [problemType, setProblemType] = useState<string>(
    model?.problemType ?? 'other'
  )
  const [tags, setTags] = useState<string[]>(model?.tags ?? [])
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!orgId || !name.trim()) {
      return
    }
    setSaving(true)
    try {
      if (model) {
        await updateModelInfo({
          variables: {
            orgId,
            id: model.id,
            input: {
              name: name.trim(),
              description,
              domain,
              problemType,
              tags,
            },
          },
        })
      } else {
        const created = await createModel({
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
        const createdId = created.data?.createMlModel.id
        if (createdId) {
          void navigate(
            `/dashboard/ml-studio/projects/${projectId}/models/${createdId}`
          )
        }
        return
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BetterDialogContent
      title={isEdit ? 'Edit model' : 'New Model'}
      description={
        isEdit
          ? 'Update this manually registered model.'
          : 'Register a model in the studio. You can add versions and experiments after.'
      }
      footerCancel
      footerSubmit={isEdit ? 'Save changes' : 'Create model'}
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
