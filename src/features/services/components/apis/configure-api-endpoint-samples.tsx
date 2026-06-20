'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { CodeMirrorRaw } from '@/components/code-mirror'
import { Button } from '@/components/ui/button'
import { LegacyApiEndpoint } from '@/features/services/api/api-v2-adapters'
import { arrayNonNullable } from 'daily-code'
import { Code } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FiEdit3 } from 'react-icons/fi'
import { HiOutlineTrash } from 'react-icons/hi2'
import { LuCloudDownload, LuCloudUpload } from 'react-icons/lu'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../contexts/service-api-endpoints'

type ConfigureApiEndpointSamplesProps = {
  endpoint: LegacyApiEndpoint
  readonly?: boolean
}

type EditState = {
  mode: 'create' | 'update'
  type: 'request' | 'response'
  index?: number
}

type DeleteState = {
  type: 'request' | 'response'
  index: number
}

export function ConfigureApiEndpointSamples({
  endpoint,
  readonly = false,
}: ConfigureApiEndpointSamplesProps) {
  const { updateServiceApiEndpoint } = useServiceApiEndpointsContext()

  const [editState, setEditState] = useState<EditState | null>(null)
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null)

  const exampleRequests = useMemo(
    () => arrayNonNullable(endpoint.exampleRequests),
    [endpoint.exampleRequests]
  )
  const exampleResponses = useMemo(
    () => arrayNonNullable(endpoint.exampleResponses),
    [endpoint.exampleResponses]
  )

  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const hasSamples = exampleRequests.length > 0 || exampleResponses.length > 0

  function startCreate(type: 'request' | 'response') {
    setEditState({ mode: 'create', type })
    setDraft('')
  }

  function startUpdate(type: 'request' | 'response', index: number) {
    const samples = type === 'request' ? exampleRequests : exampleResponses
    setEditState({ mode: 'update', type, index })
    setDraft(samples[index] ?? '')
  }

  async function handleDelete() {
    if (!deleteState) return

    if (
      !endpoint.apiEndpointId ||
      !endpoint.serviceApiGroupId ||
      !endpoint.componentMetaId
    ) {
      toast.error('Missing API endpoint data')
      return
    }

    const nextRequests =
      deleteState.type === 'request'
        ? exampleRequests.filter((_, i) => i !== deleteState.index)
        : exampleRequests
    const nextResponses =
      deleteState.type === 'response'
        ? exampleResponses.filter((_, i) => i !== deleteState.index)
        : exampleResponses

    await updateServiceApiEndpoint({
      variables: {
        apiEndpointId: endpoint.apiEndpointId,
        input: {
          serviceApiGroupId: endpoint.serviceApiGroupId,
          componentMetaId: endpoint.componentMetaId,
          order: endpoint.order ?? 0,
          exampleRequests: nextRequests,
          exampleResponses: nextResponses,
        },
      },
    })

    toast.success('Sample deleted')
  }

  async function handleSave() {
    if (!editState) {
      return
    }

    if (!draft.trim()) {
      toast.error('Enter a sample before saving')
      return
    }

    if (
      !endpoint.apiEndpointId ||
      !endpoint.serviceApiGroupId ||
      !endpoint.componentMetaId
    ) {
      toast.error('Missing API endpoint data')
      return
    }

    const trimmedValue = draft.trim()

    let nextRequests = [...exampleRequests]
    let nextResponses = [...exampleResponses]

    if (editState.mode === 'create') {
      if (editState.type === 'request') {
        nextRequests = [...exampleRequests, trimmedValue]
      } else {
        nextResponses = [...exampleResponses, trimmedValue]
      }
    } else if (editState.mode === 'update' && editState.index !== undefined) {
      if (editState.type === 'request') {
        nextRequests[editState.index] = trimmedValue
      } else {
        nextResponses[editState.index] = trimmedValue
      }
    }

    setIsSaving(true)

    try {
      await updateServiceApiEndpoint({
        variables: {
          apiEndpointId: endpoint.apiEndpointId,
          input: {
            serviceApiGroupId: endpoint.serviceApiGroupId,
            componentMetaId: endpoint.componentMetaId,
            order: endpoint.order ?? 0,
            exampleRequests: nextRequests,
            exampleResponses: nextResponses,
          },
        },
      })

      toast.success('Sample saved')
      setEditState(null)
      setDraft('')
    } catch (_error) {
      toast.error('Unable to save sample')
    } finally {
      setIsSaving(false)
    }
  }

  if (editState) {
    const sampleLabel =
      editState.type === 'request' ? 'Request Sample' : 'Response Sample'

    return (
      <div className="m-0 p-6" role="tabpanel">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#0B1220]">
            {editState.mode === 'create' ? sampleLabel : `Edit ${sampleLabel}`}
          </h4>

          <CodeMirrorRaw
            value={draft}
            minHeight={'220px'}
            onChange={(value) => setDraft(value)}
            placeholder={`Paste a ${editState.type} example`}
            fontSize={16}
            lineHeight={2}
          />
        </div>

        <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 bg-white px-6 py-3">
          <Button
            variant="ghost"
            className="h-11"
            onClick={() => {
              setEditState(null)
              setDraft('')
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            preset="primary"
            className="h-11 rounded-[0.8125rem]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Sample'}
          </Button>
        </div>
      </div>
    )
  }

  const addButtons = !readonly && (
    <div className="flex gap-2">
      <Button preset="outline" size="sm" onClick={() => startCreate('request')}>
        <LuCloudUpload className="h-3.5 w-3.5" /> Request Sample
      </Button>
      <Button
        preset="outline"
        size="sm"
        onClick={() => startCreate('response')}
      >
        <LuCloudDownload className="h-3.5 w-3.5" /> Response Sample
      </Button>
    </div>
  )

  if (!hasSamples) {
    return (
      <div className="space-y-4">
        {addButtons && <div className="flex justify-end">{addButtons}</div>}
        <div className="flex h-[240px] flex-col items-center justify-center space-y-3 text-center">
          <Code className="h-10 w-10 text-[#D1D5DB]" />
          <p className="text-sm text-[#6B7280]">
            No samples yet — add request/response examples to help developers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="m-0 space-y-4" role="tabpanel">
      {addButtons && <div className="flex justify-end">{addButtons}</div>}
      <div className="space-y-4">
        {exampleRequests.map((code, index) => (
          <Snippet
            key={`request-${index}`}
            title={`Request Sample ${index + 1}`}
            code={code}
            readonly={readonly}
            onEdit={() => startUpdate('request', index)}
            onDelete={() => setDeleteState({ type: 'request', index })}
          />
        ))}

        {exampleResponses.map((code, index) => (
          <Snippet
            key={`response-${index}`}
            title={`Response Sample ${index + 1}`}
            code={code}
            readonly={readonly}
            onEdit={() => startUpdate('response', index)}
            onDelete={() => setDeleteState({ type: 'response', index })}
          />
        ))}
      </div>

      <BetterDeleteConfirmationModal
        open={deleteState !== null}
        onOpenChange={(open) => !open && setDeleteState(null)}
        title="Delete this sample?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}

function Snippet({
  title,
  code,
  onEdit,
  onDelete,
  readonly,
}: {
  title: string
  code: string
  readonly: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="border-stock rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#0B1220]">{title}</h4>
        {!readonly && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <FiEdit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-600"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <CodeMirrorRaw
        readOnly={true}
        editable={false}
        value={code}
        fontSize={16}
        lineHeight={2}
      />
    </div>
  )
}
