import { GT } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { CirclePlusIcon } from '@/assets/svgs'
import { Button } from '@/components/ui/button'
import { DIAGRAM } from '@/features/diagram-portal/api/diagram'
import { useComponentField } from '@/features/diagram-portal/hooks/use-component-field'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { formatDistanceToNowStrict } from 'date-fns'
import { useMemo, useState } from 'react'
import { HiOutlineTrash } from 'react-icons/hi2'
import { LuImage, LuLink } from 'react-icons/lu'
import { toast } from 'sonner'
import {
  API_ENDPOINT_BY_ID,
  SERVICE_DOC_BY_ID,
  TEST_PACK_BY_ID,
} from '../api/component-link-nav'
import { FocalPointName } from './focal-point-name'
import { FocalPointMetaModal } from './meta-modal'

type MetaCardProps = {
  index: number
  component: GT.Component
  pointMeta: GT.FocalPointMeta
  showFocalPointName: boolean
  openDeleteConfirmationModal: () => void
}

function MetaMiniCardShell({
  index,
  component,
  pointMeta,
  showFocalPointName,
  openDeleteConfirmationModal,
  onClick,
  hasLink,
  showPreview,
  previewImageUrl,
  nameOverride,
}: MetaCardProps & {
  onClick: () => void
  hasLink?: boolean
  showPreview?: boolean
  previewImageUrl?: string | null
  nameOverride?: string | null
}) {
  const fields = useMemo(
    () => arrayNonNullable(pointMeta.componentModalFields),
    [pointMeta.componentModalFields]
  )
  const componentName = useComponentField<string | null>(fields, {
    label: 'Name',
  })

  const fieldCount = fields.length
  const displayName =
    nameOverride?.trim() ||
    componentName?.trim() ||
    `${component.name} ${index + 1}`

  return (
    <button
      className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border border-[#2A3242] bg-[#1E2533] px-4 py-3 text-left transition-all hover:border-[#3B6BFF]/40"
      onClick={onClick}
    >
      <div className="flex min-w-0 items-center gap-3">
        {showPreview &&
          (previewImageUrl ? (
            <img
              alt={displayName}
              src={previewImageUrl}
              className="size-9 shrink-0 rounded-md border border-[#2A3242] bg-[#0F1420] object-contain p-0.5"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#2A3242] bg-[#0F1420]">
              <LuImage className="text-paragraph size-4" />
            </span>
          ))}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {hasLink && <LuLink className="text-primary size-3 shrink-0" />}

            <span className="text-foreground block truncate text-sm font-medium">
              {displayName}

              {showFocalPointName && (
                <FocalPointName
                  pageId={pointMeta.frameId}
                  focalPointId={pointMeta.focalPointId}
                />
              )}
            </span>
          </div>

          {pointMeta.updatedAt && (
            <span className="text-paragraph mt-0.5 block text-[10px] tracking-wide">
              Updated{' '}
              {formatDistanceToNowStrict(new Date(pointMeta.updatedAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
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
  )
}

export function DiagramLinkMetaMiniCard(props: MetaCardProps) {
  const organizationId = useCurrentOrganization()?.id
  const diagramId = props.pointMeta.componentLinkDiagramId!

  const { data } = useQuery(DIAGRAM, {
    variables: { orgId: organizationId!, id: diagramId },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
  })

  return (
    <MetaMiniCardShell
      {...props}
      hasLink
      showPreview
      previewImageUrl={data?.diagram?.previewImageUrl}
      nameOverride={data?.diagram?.name}
      onClick={() => window.open(`/diagram/${diagramId}`)}
    />
  )
}

export function ApiContractLinkMetaMiniCard(props: MetaCardProps) {
  const organizationId = useCurrentOrganization()?.id

  async function open() {
    try {
      const { data } = await apolloClientGQL.query({
        query: API_ENDPOINT_BY_ID,
        variables: {
          orgId: organizationId!,
          id: props.pointMeta.componentLinkApiEndpointId!,
        },
      })
      const endpoint = data?.apiEndpointById
      if (!endpoint) return toast.error('API endpoint not found.')
      window.open(
        `/services/${endpoint.serviceId}/apis/${endpoint.apiGroupId}?endpoint=${endpoint.id}`
      )
    } catch {
      toast.error('Failed to open API contract. Please try again.')
    }
  }

  return <MetaMiniCardShell {...props} hasLink onClick={() => void open()} />
}

export function TestSuiteLinkMetaMiniCard(props: MetaCardProps) {
  const organizationId = useCurrentOrganization()?.id

  async function open() {
    try {
      const { data } = await apolloClientGQL.query({
        query: TEST_PACK_BY_ID,
        variables: {
          orgId: organizationId!,
          id: props.pointMeta.componentLinkTestPackId!,
        },
      })
      const pack = data?.testPackById
      if (!pack) return toast.error('Test suite not found.')
      window.open(`/services/${pack.serviceId}/tests?packId=${pack.testPackId}`)
    } catch {
      toast.error('Failed to open test suite. Please try again.')
    }
  }

  return <MetaMiniCardShell {...props} hasLink onClick={() => void open()} />
}

export function ServiceDocLinkMetaMiniCard(props: MetaCardProps) {
  const organizationId = useCurrentOrganization()?.id

  async function open() {
    try {
      const { data } = await apolloClientGQL.query({
        query: SERVICE_DOC_BY_ID,
        variables: {
          orgId: organizationId!,
          id: props.pointMeta.componentLinkServiceDocId!,
        },
      })
      const doc = data?.serviceDocById
      if (!doc) return toast.error('Document not found.')
      window.open(`/services/${doc.serviceId}/docs?open=${doc.docId}`)
    } catch {
      toast.error('Failed to open document. Please try again.')
    }
  }

  return <MetaMiniCardShell {...props} hasLink onClick={() => void open()} />
}

export function FocalPointMetaMiniCard({
  index,
  component,
  pointMeta,
  showFocalPointName,
  openDeleteConfirmationModal,
  updatePointMeta,
}: MetaCardProps & {
  updatePointMeta: (input: {
    componentModalFields?: GT.ComponentModalFieldInput[]
  }) => Promise<void>
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')

  const fields = useMemo(
    () => arrayNonNullable(pointMeta.componentModalFields),
    [pointMeta.componentModalFields]
  )

  return (
    <>
      <MetaMiniCardShell
        index={index}
        component={component}
        pointMeta={pointMeta}
        showFocalPointName={showFocalPointName}
        openDeleteConfirmationModal={openDeleteConfirmationModal}
        onClick={() => setIsModalOpen(true)}
      />

      <FocalPointMetaModal
        isOpen={isModalOpen}
        setIsOpen={(open) => {
          setIsModalOpen(open)
          setModalMode('view')
        }}
        submitLabel="Update Now"
        isViewMode={modalMode === 'view'}
        setEditMode={() => setModalMode('edit')}
        title={`${modalMode === 'view' ? '' : 'Edit'} ${component.name} ${index + 1 || ''}`}
        description={component.description}
        fields={fields}
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
