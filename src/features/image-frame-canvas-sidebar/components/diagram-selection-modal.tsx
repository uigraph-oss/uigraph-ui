import { BetterDialogContent } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { GET_DIAGRAMS_BY_ORG_ID } from '@/features/dashboard-diagrams/api/diagrams'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useState } from 'react'

type DiagramSelectionModalProps = {
  onSelect: (diagramId: string) => Promise<void>
}

export function DiagramSelectionModal({
  onSelect,
}: DiagramSelectionModalProps) {
  const organizationId = useCurrentOrganization()?.id

  const [isLoading, setIsLoading] = useState(false)
  const [selectedDiagramId, setSelectedDiagramId] = useState<string>('')

  const { data: diagramsData, loading: diagramsLoading } = useQuery(
    GET_DIAGRAMS_BY_ORG_ID,
    {
      variables: { organizationId },
      fetchPolicy: 'cache-first',
    }
  )

  const diagrams = arrayNonNullable(diagramsData?.v1GetDiagramsByOrgId)

  async function handleSelect() {
    if (!selectedDiagramId) return

    try {
      setIsLoading(true)
      await onSelect(selectedDiagramId)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BetterDialogContent
      title="Select Diagram"
      description="Select a diagram to link to this focal point"
      onFooterSubmitClick={handleSelect}
      footerSubmitLoading={isLoading}
      footerSubmit="Connect Diagram"
      footerCancel
    >
      <div className="space-y-6">
        {diagramsLoading ? (
          <SectionLoader label="Loading diagrams..." />
        ) : diagrams.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#6B7480]">No diagrams available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {diagrams.map((diagram) => (
              <div
                key={diagram.diagramId}
                className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  selectedDiagramId === diagram.diagramId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedDiagramId(diagram.diagramId ?? '')}
              >
                <img
                  alt={diagram.componentFlowDiagramName ?? 'Blank Diagram'}
                  src={diagram.previewImageFileId ?? '/placeholder.svg'}
                  className="aspect-square w-full rounded-md object-cover object-top"
                />
                <div className="mt-2">
                  <h4 className="line-clamp-1 text-sm font-medium text-[#161616]">
                    {diagram.componentFlowDiagramName ?? 'Blank Diagram'}
                  </h4>
                </div>
                {selectedDiagramId === diagram.diagramId && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BetterDialogContent>
  )
}
