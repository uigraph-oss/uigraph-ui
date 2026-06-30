'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { CodeMirrorRaw } from '@/components/code-mirror'
import { Button } from '@/components/ui/button'
import { LegacyApiEndpoint } from '@/features/services/api/api-adapters'
import { cn } from '@/lib/utils'
import {
  canonicalizeSampleJson,
  formatSampleForDisplay,
} from '@/utils/api/openapi-display'
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
  className?: string
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
  className = 'px-6',
}: ConfigureApiEndpointSamplesProps) {
  const { updateServiceApiEndpoint, protocol } = useServiceApiEndpointsContext()

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
    setDraft(formatSampleForDisplay(samples[index] ?? '', protocol, type))
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
      toast.success('Sample deleted')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to delete sample'
      toast.error(message || 'Unable to delete sample')
    }
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

    const trimmedValue = canonicalizeSampleJson(draft.trim())

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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save sample'
      toast.error(message || 'Unable to save sample')
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
          <h4 className="text-sm font-semibold text-[#F4F7FC]">
            {editState.mode === 'create' ? sampleLabel : `Edit ${sampleLabel}`}
          </h4>

          <div className="border-stock overflow-hidden rounded-[0.75rem] border">
            <CodeMirrorRaw
              value={draft}
              minHeight={'220px'}
              onChange={(value) => setDraft(value)}
              placeholder={`Paste a ${editState.type} example`}
            />
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 bg-[#141925] px-6 py-3">
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
      <div className={cn('space-y-4 pb-4', className)}>
        {addButtons && <div className="flex justify-end">{addButtons}</div>}
        <div className="flex h-[240px] flex-col items-center justify-center space-y-3 text-center">
          <Code className="h-10 w-10 text-[#D1D5DB]" />
          <p className="text-sm text-[#828DA3]">
            No samples yet — add request/response examples to help developers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('m-0 space-y-4 pb-4', className)} role="tabpanel">
      {addButtons && <div className="flex justify-end">{addButtons}</div>}
      <div className="space-y-5">
        {exampleRequests.map((code, index) => (
          <Snippet
            key={`request-${index}`}
            title={`Request Sample ${index + 1}`}
            code={code}
            kind="request"
            protocol={protocol}
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
            kind="response"
            protocol={protocol}
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
  kind,
  protocol,
  onEdit,
  onDelete,
  readonly,
}: {
  title: string
  code: string
  kind: 'request' | 'response'
  protocol: string
  readonly: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const formattedCode = useMemo(
    () => formatSampleForDisplay(code, protocol, kind),
    [code, protocol, kind]
  )

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#F4F7FC]">{title}</h4>
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

      <div className="border-stock overflow-hidden rounded-[0.75rem] border">
        <CodeMirrorRaw readOnly={true} editable={false} value={formattedCode} />
      </div>
    </div>
  )
}
