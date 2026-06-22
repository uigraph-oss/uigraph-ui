import { V2 } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { BetterDialogProvider } from '@/components/better-dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  COMPONENT_API_CONTRACT_ID,
  COMPONENT_FLOW_DIAGRAM_ID,
  COMPONENT_SUPPORT_KB_ID,
  COMPONENT_TEST_SUITE_ID,
} from '@/constants/component-meta'
import { CREATE_DIAGRAM } from '@/features/dashboard-diagrams/api/diagrams'
import {
  SERVICE_DOCS,
  serviceDocToLegacy,
} from '@/features/services/api/service-doc'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { arrayNonNullable } from 'daily-code'
import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { LuLink } from 'react-icons/lu'
import { toast } from 'sonner'
import { getFocalPointComponentIcon } from '../../../helpers/get-component-icon'
import { ComponentFieldInput, PointMeta } from '../api/focal-point-meta'
import { ApiContractSelectionModal } from './api-contract-selection-modal'
import { DeletePointMetaConfirmationModal } from './delete-meta-confirm-modal'
import { DiagramSelectionModal } from './diagram-selection-modal'
import {
  FocalPointMetaMiniCard,
  FocalPointMetaMiniCardNew,
} from './meta-mini-card'
import { FocalPointMetaModal } from './meta-modal'
import { ServiceDocSelectionModal } from './service-doc-selection-modal'
import { TestSuiteSelectionModal } from './test-suite-selection-modal'

export type FocalPointMetaSectionProps = {
  component: V2.Component
  componentPointMeta: PointMeta[]

  showFocalPointName?: boolean
  disableCreatePointMeta?: boolean

  createPointMeta: (
    componentId: string,
    input: {
      componentModalFields?: ComponentFieldInput[]
      componentLinkId?: string
      componentFlowDiagram?: string
    }
  ) => Promise<void>

  updatePointMeta: (
    pointMetaId: string,
    componentId: string,
    input: { componentModalFields?: ComponentFieldInput[] }
  ) => Promise<void>

  deletePointMeta: (pointMetaId: string) => Promise<void>
}

export function FocalPointMetaSection({
  component,
  componentPointMeta,
  createPointMeta,
  updatePointMeta,
  deletePointMeta,
  showFocalPointName,
  disableCreatePointMeta,
}: FocalPointMetaSectionProps) {
  const organizationId = useCurrentOrganization()?.id

  const [isNewModal, setIsNewModal] = useState(false)
  const [deleteConfirmationPointMeta, setDeleteConfirmationPointMeta] =
    useState<string | null>(null)

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const isFlowDiagram = component.componentId === COMPONENT_FLOW_DIAGRAM_ID
  const isApiContract = component.componentId === COMPONENT_API_CONTRACT_ID
  const isTestSuite = component.componentId === COMPONENT_TEST_SUITE_ID
  const isServiceDoc = component.componentId === COMPONENT_SUPPORT_KB_ID

  const linkLabel = isFlowDiagram
    ? 'Diagram'
    : isApiContract
      ? 'API Contract'
      : isTestSuite
        ? 'Test Suite'
        : isServiceDoc
          ? 'Documentation'
          : undefined

  const canComponentBeLinked = !!linkLabel

  async function startFlowDiagram(meta: PointMeta | null) {
    if (meta) {
      if (meta.componentFlowDiagram?.startsWith('diagram_')) {
        return window.open(`/diagram/${meta.componentFlowDiagram}`)
      }

      if (meta.componentLinkId?.startsWith('diagram_')) {
        return window.open(`/diagram/${meta.componentLinkId}`)
      }

      return toast.error('Invalid diagram ID. Please try again.')
    }

    try {
      const { data: createDiagramData } = await apolloClientGQL.mutate({
        mutation: CREATE_DIAGRAM,
        variables: {
          orgId: organizationId!,
          input: {
            name: component.name ?? 'Flow Diagram',
            content: JSON.stringify({ nodes: [], edges: [] }),
          },
        },
      })

      const diagramId = createDiagramData?.createDiagram?.id
      if (!diagramId) {
        return toast.error('Failed to create diagram. Please try again.')
      }

      await createPointMeta(component.componentId!, {
        componentFlowDiagram: diagramId,
      })
      return window.open(`/diagram/${diagramId}`)
    } catch {
      void toast.error(
        'Failed to create diagram or focal point meta. Please try again.'
      )
    }
  }

  function startTestSuite(meta: PointMeta) {
    const [serviceId, testPackId] = (meta.componentLinkId ?? '').split(':')
    if (!serviceId || !testPackId)
      return toast.error('Invalid test suite link. Please try again.')
    window.open(`/services/${serviceId}/tests?packId=${testPackId}`)
  }

  async function startServiceDoc(meta: PointMeta) {
    const [serviceId, serviceDocId] = (meta.componentLinkId ?? '').split(':')
    if (!serviceId || !serviceDocId)
      return toast.error('Invalid document link. Please try again.')
    const { data } = await apolloClientGQL.query({
      query: SERVICE_DOCS,
      variables: { orgId: organizationId!, serviceId },
      fetchPolicy: 'cache-first',
    })
    const doc = arrayNonNullable(data?.serviceDocs)
      .map(serviceDocToLegacy)
      .find((item) => item.serviceDocId === serviceDocId)
    const fileURL = doc?.fileURL
    if (!fileURL)
      return toast.error('Unable to open document. Please try again.')
    window.open(fileURL)
  }

  function startCompositeLink(meta: PointMeta) {
    if (isTestSuite) return startTestSuite(meta)
    if (isServiceDoc) return startServiceDoc(meta)
  }

  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="overflow-hidden rounded-[0.8125rem] border border-[#2A3242] bg-[#1E2533]"
        value={componentPointMeta.length > 0 ? undefined : 'none'}
      >
        <AccordionItem value="item-1">
          <div
            key={component.componentId}
            className="flex w-full items-center justify-between gap-3 rounded-none px-4 py-4"
          >
            <div className="flex gap-2">
              <div className="self-start text-[2.25rem]">
                {getFocalPointComponentIcon({
                  component: component.componentId,
                  category: component.category,
                })}
              </div>

              <div className={'flex flex-col gap-1'}>
                <h4 className="text-sm font-medium">{component.name}</h4>

                <p className="text-paragraph text-xs">
                  {component.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              {componentPointMeta.length > 0 && (
                <span className="text-primary bg-primary/20 flex h-5 items-center justify-center rounded-lg p-1 px-2 text-xs font-bold">
                  {componentPointMeta.length}
                </span>
              )}

              <div className="flex items-center">
                {componentPointMeta.length === 0 && !disableCreatePointMeta && (
                  <AccordionTrigger
                    className={cn(
                      'text-primary bg-primary/5 flex h-9 items-center justify-center rounded-full px-4 font-medium hover:no-underline [&>svg]:last:hidden',
                      canComponentBeLinked && 'rounded-r-none'
                    )}
                    onClick={(e) => {
                      e.preventDefault()

                      if (component.componentId === COMPONENT_FLOW_DIAGRAM_ID) {
                        startFlowDiagram(null).catch(console.warn)
                      } else {
                        setIsNewModal(true)
                      }
                    }}
                  >
                    Add
                  </AccordionTrigger>
                )}

                {componentPointMeta.length > 0 && (
                  <AccordionTrigger
                    className={cn(
                      'text-primary bg-primary/5 flex h-9 items-center justify-center rounded-full px-2 font-medium hover:no-underline [&>svg]:last:hidden'
                    )}
                  >
                    <FiChevronDown className="text-lg transition-all" />
                  </AccordionTrigger>
                )}

                {canComponentBeLinked &&
                  !disableCreatePointMeta &&
                  componentPointMeta.length === 0 && (
                    <button
                      onClick={() => setIsLinkModalOpen(true)}
                      className="text-primary border-primary/10 bg-primary/5 flex size-9 items-center justify-center rounded-full rounded-l-none border-l pr-1 font-medium hover:no-underline"
                    >
                      <LuLink className="size-4 shrink-0" />
                    </button>
                  )}
              </div>
            </div>
          </div>

          <AccordionContent className="border-t border-[#2A3242] bg-[#141925] p-3">
            <div
              className={cn(
                'flex flex-col gap-2',
                !disableCreatePointMeta && 'mb-3'
              )}
            >
              {componentPointMeta.map((point, i) => (
                <FocalPointMetaMiniCard
                  key={point.focalPointMetaId}
                  index={i}
                  pointMeta={point}
                  component={component}
                  showFocalPointName={showFocalPointName ?? false}
                  updatePointMeta={async ({ componentModalFields }) => {
                    await updatePointMeta(
                      point.focalPointMetaId!,
                      component.componentId!,
                      {
                        componentModalFields,
                      }
                    )
                  }}
                  openDeleteConfirmationModal={() =>
                    setDeleteConfirmationPointMeta(
                      point.focalPointMetaId ?? null
                    )
                  }
                  startFlowDiagram={() => startFlowDiagram(point)}
                  startCompositeLink={() => startCompositeLink(point)}
                />
              ))}
            </div>

            {!disableCreatePointMeta && (
              <FocalPointMetaMiniCardNew
                startFlowDiagram={() => startFlowDiagram(null)}
                setIsNewModal={setIsNewModal}
                setIsLinkModalOpen={setIsLinkModalOpen}
                isFlowDiagram={isFlowDiagram}
                linkLabel={linkLabel}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <DeletePointMetaConfirmationModal
        open={Boolean(deleteConfirmationPointMeta)}
        onOpenChange={() => setDeleteConfirmationPointMeta(null)}
        onConfirm={async () => {
          if (!deleteConfirmationPointMeta) return

          try {
            await deletePointMeta(deleteConfirmationPointMeta)
            toast.success('Focal point meta deleted successfully')
          } catch {
            toast.error(
              'Failed to delete focal point meta. Please try again later.'
            )
          }

          setDeleteConfirmationPointMeta(null)
        }}
      />

      <FocalPointMetaModal
        submitLabel="Create Now"
        title={`${'New'} ${component.name}`}
        description={component.description}
        fields={arrayNonNullable(component.componentFields)}
        isOpen={isNewModal}
        setIsOpen={setIsNewModal}
        submit={async (formData) => {
          try {
            await createPointMeta(component.componentId!, {
              componentModalFields: formData,
            })
            toast.success('Focal point meta created successfully')
          } catch {
            return void toast.error(
              'Failed to create focal point meta. Please try again.'
            )
          }

          setIsNewModal(false)
        }}
      />

      <BetterDialogProvider
        open={isLinkModalOpen && isApiContract}
        onOpenChange={setIsLinkModalOpen}
      >
        <ApiContractSelectionModal
          onSelect={async (formData) => {
            try {
              await createPointMeta(component.componentId!, {
                componentLinkId: formData.apiEndpointId,
              })
              setIsLinkModalOpen(false)
              toast.success('Focal point meta created successfully')
            } catch {
              return void toast.error(
                'Failed to create focal point meta. Please try again.'
              )
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={isLinkModalOpen && isFlowDiagram}
        onOpenChange={setIsLinkModalOpen}
      >
        <DiagramSelectionModal
          onSelect={async (formData) => {
            try {
              await createPointMeta(component.componentId!, {
                componentLinkId: formData,
              })
              toast.success('Focal point meta created successfully')
              setIsLinkModalOpen(false)
            } catch {
              return void toast.error(
                'Failed to create focal point meta. Please try again.'
              )
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={isLinkModalOpen && isTestSuite}
        onOpenChange={setIsLinkModalOpen}
      >
        <TestSuiteSelectionModal
          onSelect={async (formData) => {
            try {
              await createPointMeta(component.componentId!, {
                componentLinkId: `${formData.serviceId}:${formData.testPackId}`,
              })
              setIsLinkModalOpen(false)
              toast.success('Focal point meta created successfully')
            } catch {
              return void toast.error(
                'Failed to create focal point meta. Please try again.'
              )
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={isLinkModalOpen && isServiceDoc}
        onOpenChange={setIsLinkModalOpen}
      >
        <ServiceDocSelectionModal
          onSelect={async (formData) => {
            try {
              await createPointMeta(component.componentId!, {
                componentLinkId: `${formData.serviceId}:${formData.serviceDocId}`,
              })
              setIsLinkModalOpen(false)
              toast.success('Focal point meta created successfully')
            } catch {
              return void toast.error(
                'Failed to create focal point meta. Please try again.'
              )
            }
          }}
        />
      </BetterDialogProvider>
    </>
  )
}
