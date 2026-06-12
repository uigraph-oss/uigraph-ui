'use client'

import { CirclePlusIcon } from '@/assets/svgs'
import { SuperCircleLoader } from '@/components/loader'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_SERVICE_DIAGRAM_MUTATION,
  GET_SERVICE_DIAGRAMS_WITH_META_QUERY,
} from '../../api/service-diagram'
import { useServiceContext } from '../../contexts/service-context'
import { FlowDiagramCard } from './flow-diagram-card'

const PAGE_SIZE = 12

function getPageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i)

  const pages: (number | '...')[] = []
  pages.push(0)

  const windowStart = Math.max(1, current - 1)
  const windowEnd = Math.min(total - 2, current + 1)

  if (windowStart > 1) pages.push('...')
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i)
  if (windowEnd < total - 2) pages.push('...')

  pages.push(total - 1)
  return pages
}

export function DashboardServiceDiagrams() {
  const { serviceId } = useServiceContext()
  const [page, setPage] = useState(0)

  const { data, loading: isLoadingServiceDiagrams } = useQuery(
    GET_SERVICE_DIAGRAMS_WITH_META_QUERY,
    {
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first',
      variables: { serviceId },
    }
  )

  const [createServiceDiagram, { loading: isCreatingServiceDiagram }] =
    useMutation(CREATE_SERVICE_DIAGRAM_MUTATION, {
      awaitRefetchQueries: true,
      refetchQueries: [GET_SERVICE_DIAGRAMS_WITH_META_QUERY],
    })

  const serviceDiagramsWithMeta = useMemo(() => {
    return arrayNonNullable(data?.v1GetServiceDiagramsWithMeta).filter(
      (s) => s.diagram?.diagramId
    )
  }, [data])

  const totalPages = Math.ceil(serviceDiagramsWithMeta.length / PAGE_SIZE)
  const pageItems = serviceDiagramsWithMeta.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  )

  async function handleCreateServiceDiagram() {
    try {
      const { data } = await createServiceDiagram({
        variables: { input: { serviceId } },
      })

      const diagramId = data?.v1CreateServiceDiagram?.serviceDiagramDiagramId
      if (!diagramId) throw new Error()

      window.open(`/diagram/${diagramId}`, '_blank')
      toast.success('Diagram created successfully')
    } catch {
      toast.error('Failed to create diagram')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Diagrams"
        description="Visualize service architecture with flow diagrams and dependency maps."
      >
        <Button
          preset="primary"
          disabled={isCreatingServiceDiagram}
          onClick={handleCreateServiceDiagram}
        >
          {isCreatingServiceDiagram ? (
            <SuperCircleLoader />
          ) : (
            <CirclePlusIcon />
          )}
          Create Diagram
        </Button>
      </DashboardSectionHeader>

      <DashboardSectionContent noPadding>
        {isLoadingServiceDiagrams ? (
          <SectionLoader label="Loading diagrams..." />
        ) : serviceDiagramsWithMeta.length > 0 ? (
          <div className="space-y-4 p-6">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              }}
            >
              {pageItems.map((serviceDiagramWithMeta) => (
                <FlowDiagramCard
                  key={serviceDiagramWithMeta.serviceDiagram?.serviceDiagramId}
                  serviceDiagram={serviceDiagramWithMeta.serviceDiagram!}
                  diagram={serviceDiagramWithMeta.diagram!}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  preset="outline"
                  className="h-8 px-3 text-sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPageWindow(page, totalPages).map((entry, i) =>
                    entry === '...' ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="flex h-8 w-8 items-center justify-center text-sm text-[#999]"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={entry}
                        onClick={() => setPage(entry as number)}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                          entry === page
                            ? 'bg-primary text-white'
                            : 'text-[#555] hover:bg-[#F0F0F2]'
                        )}
                      >
                        {(entry as number) + 1}
                      </button>
                    )
                  )}
                </div>

                <Button
                  preset="outline"
                  className="h-8 px-3 text-sm"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <SectionNotFound plain label="No diagrams found" />
        )}
      </DashboardSectionContent>
    </div>
  )
}
