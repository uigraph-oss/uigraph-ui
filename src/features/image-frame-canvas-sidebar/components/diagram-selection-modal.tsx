import { clientV2 } from '@/api-v2/client'
import { BetterDialogContent } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { DIAGRAMS_V2 } from '@/features/dashboard-diagrams/api/diagrams-v2'
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
    DIAGRAMS_V2,
    {
      client: clientV2,
      variables: { orgId: organizationId! },
      skip: !organizationId,
      fetchPolicy: 'cache-first',
    }
  )

  const diagrams = arrayNonNullable(diagramsData?.diagrams)

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
                key={diagram.id}
                className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  selectedDiagramId === diagram.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedDiagramId(diagram.id ?? '')}
              >
                <img
                  alt={diagram.name ?? 'Blank Diagram'}
                  src={diagram.previewImageUrl ?? '/placeholder.svg'}
                  className="aspect-square w-full rounded-md object-cover object-top"
                />
                <div className="mt-2">
                  <h4 className="line-clamp-1 text-sm font-medium text-[#161616]">
                    {diagram.name ?? 'Blank Diagram'}
                  </h4>
                </div>
                {selectedDiagramId === diagram.id && (
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
