'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { CodeMirrorRaw } from '@/components/code-mirror'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LegacyApiEndpoint } from '@/features/services/api/api-adapters'
import { useScopedStorage } from '@/hooks/use-scoped-storage'
import { cn } from '@/lib/utils'
import {
  canonicalizeSampleJson,
  formatSampleForDisplay,
} from '@/utils/api/openapi-display'
import { arrayNonNullable } from 'daily-code'
import { ArrowUpRight, Code, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FiEdit3 } from 'react-icons/fi'
import { HiOutlineTrash } from 'react-icons/hi2'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../contexts/service-api-endpoints'

type SampleKind = 'request' | 'response'

type ConfigureApiEndpointSamplesProps = {
  endpoint: LegacyApiEndpoint
  readonly?: boolean
  className?: string
}

type EditState = {
  mode: 'create' | 'update'
  type: SampleKind
  index?: number
}

type DeleteState = {
  type: SampleKind
  index: number
}

const SAMPLE_TAB_STORAGE_KEY = 'api-endpoint-samples-tab'

export function ConfigureApiEndpointSamples({
  endpoint,
  readonly = false,
  className = 'px-6',
}: ConfigureApiEndpointSamplesProps) {
  const { updateServiceApiEndpoint, protocol } = useServiceApiEndpointsContext()

  const [storedTab, setStoredTab] = useScopedStorage<SampleKind>(
    SAMPLE_TAB_STORAGE_KEY,
    'request'
  )
  const activeTab: SampleKind =
    storedTab === 'response' ? 'response' : 'request'

  const [editState, setEditState] = useState<EditState | null>(null)
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null)
  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const exampleRequests = useMemo(
    () => arrayNonNullable(endpoint.exampleRequests),
    [endpoint.exampleRequests]
  )
  const exampleResponses = useMemo(
    () => arrayNonNullable(endpoint.exampleResponses),
    [endpoint.exampleResponses]
  )

  const activeSamples =
    activeTab === 'request' ? exampleRequests : exampleResponses

  function setActiveTab(tab: SampleKind) {
    setStoredTab(tab)
  }

  function startCreate(type: SampleKind) {
    setActiveTab(type)
    setEditState({ mode: 'create', type })
    setDraft('')
  }

  function startUpdate(type: SampleKind, index: number) {
    const samples = type === 'request' ? exampleRequests : exampleResponses
    setActiveTab(type)
    setEditState({ mode: 'update', type, index })
    setDraft(formatSampleForDisplay(samples[index] ?? '', protocol, type))
  }

  function closeEditModal() {
    setEditState(null)
    setDraft('')
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
      closeEditModal()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save sample'
      toast.error(message || 'Unable to save sample')
    } finally {
      setIsSaving(false)
    }
  }

  const sampleLabel =
    editState?.type === 'response' ? 'Response Sample' : 'Request Sample'

  return (
    <div
      className={cn('relative m-0 pb-16', className)}
      role="tabpanel"
    >
      <SampleTabBar
        activeTab={activeTab}
        requestCount={exampleRequests.length}
        responseCount={exampleResponses.length}
        onTabChange={setActiveTab}
      />

      <div className="mt-4 space-y-3">
        {activeSamples.length === 0 ? (
          <SampleEmptyState
            kind={activeTab}
            readonly={readonly}
            onAdd={() => startCreate(activeTab)}
          />
        ) : (
          activeSamples.map((code, index) => (
            <SampleCard
              key={`${activeTab}-${index}`}
              title={`${activeTab === 'request' ? 'Request' : 'Response'} Sample ${index + 1}`}
              code={code}
              kind={activeTab}
              protocol={protocol}
              readonly={readonly}
              onEdit={() => startUpdate(activeTab, index)}
              onDelete={() => setDeleteState({ type: activeTab, index })}
            />
          ))
        )}
      </div>

      {!readonly && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              preset="primary"
              size="icon"
              aria-label={`Add ${activeTab} sample`}
              className="absolute right-0 bottom-0 h-11 w-11 rounded-full shadow-lg"
              onClick={() => startCreate(activeTab)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            Add {activeTab === 'request' ? 'request' : 'response'} sample
          </TooltipContent>
        </Tooltip>
      )}

      <EditSampleModal
        open={editState !== null}
        title={
          editState?.mode === 'create'
            ? sampleLabel
            : `Edit ${sampleLabel}`
        }
        draft={draft}
        sampleType={editState?.type ?? 'request'}
        isSaving={isSaving}
        onDraftChange={setDraft}
        onSave={handleSave}
        onCancel={closeEditModal}
      />

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

function SampleTabBar({
  activeTab,
  requestCount,
  responseCount,
  onTabChange,
}: {
  activeTab: SampleKind
  requestCount: number
  responseCount: number
  onTabChange: (tab: SampleKind) => void
}) {
  const tabs: { id: SampleKind; label: string; count: number }[] = [
    { id: 'request', label: 'Requests', count: requestCount },
    { id: 'response', label: 'Responses', count: responseCount },
  ]

  return (
    <div
      className="flex gap-1 border-b border-[#2A3242]"
      role="tablist"
      aria-label="Sample type"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'text-[#F4F7FC]'
                : 'text-[#828DA3] hover:text-[#C5CDDB]'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
                isActive
                  ? 'bg-primary/20 text-primary-foreground'
                  : 'bg-[#2A3242] text-[#828DA3]'
              )}
            >
              {tab.count}
            </span>
            {isActive && (
              <span className="bg-primary absolute right-3 bottom-0 left-3 h-0.5 rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}

function SampleEmptyState({
  kind,
  readonly,
  onAdd,
}: {
  kind: SampleKind
  readonly: boolean
  onAdd: () => void
}) {
  const label = kind === 'request' ? 'request' : 'response'

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[#2A3242] bg-[#1A2030]/40 px-6 py-10 text-center">
      <Code className="h-10 w-10 text-[#828DA3]" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#F4F7FC]">
          No {label} samples yet
        </p>
        <p className="text-sm text-[#828DA3]">
          Add {label} examples to help developers understand this endpoint.
        </p>
      </div>
      {!readonly && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary mt-1 gap-1.5"
          onClick={onAdd}
        >
          Add your first {label} sample
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

function SampleCard({
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
  kind: SampleKind
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
    <article
      className={cn(
        'overflow-hidden rounded-[16px] border border-[#2A3242] bg-[#1A2030]/60 shadow-sm',
        kind === 'request'
          ? 'border-l-[3px] border-l-blue-500'
          : 'border-l-[3px] border-l-emerald-500'
      )}
    >
      <div className="flex items-center justify-between border-b border-[#2A3242] px-4 py-2.5">
        <h4 className="text-sm font-medium text-[#F4F7FC]">{title}</h4>
        {!readonly && (
          <div className="flex gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#C5CDDB] hover:text-[#F4F7FC]"
              aria-label={`Edit ${title}`}
              onClick={onEdit}
            >
              <FiEdit3 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
              aria-label={`Delete ${title}`}
              onClick={onDelete}
            >
              <HiOutlineTrash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        <CodeMirrorRaw readOnly editable={false} value={formattedCode} />
      </div>
    </article>
  )
}

function EditSampleModal({
  open,
  title,
  draft,
  sampleType,
  isSaving,
  onDraftChange,
  onSave,
  onCancel,
}: {
  open: boolean
  title: string
  draft: string
  sampleType: SampleKind
  isSaving: boolean
  onDraftChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel()
      }}
    >
      <DialogContent className="max-w-2xl gap-0 border-[#2A3242] bg-[#141925] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-[#2A3242] px-6 py-4">
          <DialogTitle className="text-[#F4F7FC]">{title}</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="overflow-hidden rounded-[0.75rem] border border-[#2A3242]">
            <CodeMirrorRaw
              value={draft}
              minHeight="220px"
              onChange={onDraftChange}
              placeholder={`Paste a ${sampleType} example`}
            />
          </div>
        </div>

        <DialogFooter className="border-t border-[#2A3242] px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            preset="primary"
            className="h-11 rounded-[0.8125rem]"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Sample'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
