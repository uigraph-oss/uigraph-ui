import { V2 } from '@/api'
import { CirclePlusIcon } from '@/assets/svgs'
import { Button } from '@/components/ui/button'
import { COMPONENT_FLOW_DIAGRAM_ID } from '@/constants/component-meta'
import { useComponentField } from '@/features/diagram-portal/hooks/use-component-field'
import { cn } from '@/lib/utils'
import { arrayNonNullable } from 'daily-code'
import { formatDistanceToNowStrict } from 'date-fns'
import { useMemo, useState } from 'react'
import { HiOutlineTrash } from 'react-icons/hi2'
import { LuLink } from 'react-icons/lu'
import { toast } from 'sonner'
import { ComponentFieldInput, PointMeta } from '../api/focal-point-meta'
import { FocalPointName } from './focal-point-name'
import { FocalPointMetaModal } from './meta-modal'

type FocalPointMetaMiniCardProps = {
  index: number
  component: V2.Component
  pointMeta: PointMeta
  showFocalPointName: boolean
  startFlowDiagram: () => void
  startCompositeLink: () => void
  openDeleteConfirmationModal: () => void
  updatePointMeta: (input: {
    componentModalFields?: ComponentFieldInput[]
  }) => Promise<void>
}

export function FocalPointMetaMiniCard({
  index,
  component,
  pointMeta,
  showFocalPointName,
  startFlowDiagram,
  startCompositeLink,
  openDeleteConfirmationModal,
  updatePointMeta,
}: FocalPointMetaMiniCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')

  const memoizedComponentModalFields = useMemo(() => {
    return arrayNonNullable(pointMeta.componentModalFields)
  }, [pointMeta.componentModalFields])

  const componentName = useComponentField<string | null>(
    memoizedComponentModalFields,
    { label: 'Name' }
  )

  const fieldCount = memoizedComponentModalFields.length
  const displayName = componentName?.trim() || `${component.name} ${index + 1}`

  return (
    <>
      <button
        className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg bg-white px-4 py-3 text-left transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
        onClick={() => {
          if (component.componentId === COMPONENT_FLOW_DIAGRAM_ID) {
            startFlowDiagram()
          } else if (pointMeta.componentLinkId?.includes(':')) {
            startCompositeLink()
          } else {
            setIsModalOpen(true)
          }
        }}
      >
        <div>
          <div className="flex items-center gap-1.5">
            {pointMeta.componentLinkId && (
              <LuLink className="text-primary size-3 shrink-0" />
            )}

            <span className="text-foreground block truncate text-sm font-medium">
              {displayName}

              {showFocalPointName && (
                <FocalPointName
                  pageId={pointMeta.pageId!}
                  focalPointId={pointMeta.focalPointId!}
                />
              )}
            </span>
          </div>

          {pointMeta.updatedAt && (
            <span className="mt-0.5 block text-[10px] tracking-wide text-gray-400">
              Updated{' '}
              {formatDistanceToNowStrict(new Date(pointMeta.updatedAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {fieldCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-0.5">
                {Array.from({ length: Math.min(fieldCount, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'size-1.5 rounded-full',
                      i === 0 && 'bg-primary',
                      i === 1 && 'bg-primary/60',
                      i === 2 && 'bg-primary/30',
                      i >= 3 && 'bg-primary/15'
                    )}
                  />
                ))}
              </div>
              <span className="text-paragraph text-[10px] font-medium tabular-nums">
                {fieldCount} field{fieldCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <span
            className="text-destructive/80 hover:text-destructive bg-destructive/5 hover:bg-destructive/15 -mr-1 flex size-6 items-center justify-center rounded-sm transition-all"
            onClick={(e) => {
              e.stopPropagation()
              openDeleteConfirmationModal()
            }}
          >
            <HiOutlineTrash className="size-4" />
          </span>
        </div>
      </button>

      <FocalPointMetaModal
        isOpen={isModalOpen}
        setIsOpen={(open) => {
          setIsModalOpen(open)
          setModalMode('view')
        }}
        submitLabel="Update Now"
        isViewMode={modalMode === 'view'}
        isReadOnly={!!pointMeta.componentLinkId}
        setEditMode={() => setModalMode('edit')}
        title={`${modalMode === 'view' ? '' : 'Edit'} ${component.name} ${index + 1 || ''}`}
        description={component.description}
        fields={memoizedComponentModalFields}
        componentMetaId={pointMeta.componentLinkId}
        submit={async (fieldsInput) => {
          try {
            await updatePointMeta({ componentModalFields: fieldsInput })
            toast.success('Focal point meta updated successfully')
          } catch {
            return void toast.error(
              'Failed to update focal point meta. Please try again.'
            )
          }

          setIsModalOpen(false)
          setModalMode('view')
        }}
      />
    </>
  )
}

export function FocalPointMetaMiniCardNew({
  startFlowDiagram,
  setIsNewModal,
  setIsLinkModalOpen,
  isFlowDiagram,
  linkLabel,
}: {
  startFlowDiagram: () => void
  setIsNewModal: (open: boolean) => void
  setIsLinkModalOpen: (open: boolean) => void
  isFlowDiagram: boolean
  linkLabel?: string
}) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-[0.8125rem] font-medium">
      <Button
        preset="primary"
        onClick={() => {
          if (isFlowDiagram) {
            startFlowDiagram()
          } else {
            setIsNewModal(true)
          }
        }}
      >
        <CirclePlusIcon /> Create New
      </Button>

      {linkLabel && (
        <>
          <span className="text-paragraph mx-1 flex text-xs leading-0 font-extralight">
            or
          </span>

          <Button preset="outline" onClick={() => setIsLinkModalOpen(true)}>
            Link to {linkLabel}
          </Button>
        </>
      )}
    </div>
  )
}
