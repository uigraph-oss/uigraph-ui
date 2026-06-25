import { BetterDialogContent } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { DIAGRAMS } from '@/features/dashboard-diagrams/api/diagrams'
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

  const { data: diagramsData, loading: diagramsLoading } = useQuery(DIAGRAMS, {
    variables: { orgId: organizationId! },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
  })

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
            <p className="text-muted-foreground text-sm">
              No diagrams available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {diagrams.map((diagram) => (
              <div
                key={diagram.id}
                className={`bg-card relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  selectedDiagramId === diagram.id
                    ? 'border-primary bg-primary/10'
                    : 'border-stock hover:border-primary/50'
                }`}
                onClick={() => setSelectedDiagramId(diagram.id ?? '')}
              >
                <img
                  alt={diagram.name ?? 'Blank Diagram'}
                  src={diagram.previewImageUrl ?? '/placeholder.svg'}
                  className="aspect-square w-full rounded-md object-cover object-top"
                />
                <div className="mt-2">
                  <h4 className="text-foreground line-clamp-1 text-sm font-medium">
                    {diagram.name ?? 'Blank Diagram'}
                  </h4>
                </div>
                {selectedDiagramId === diagram.id && (
                  <div className="bg-primary absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full">
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
