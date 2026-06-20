import { clientV2 } from '@/api-v2/client'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  DIAGRAM_CONTENT_V2,
  DIAGRAM_V2,
} from '@/features/diagram-portal/api/diagram-v2'
import { FlowDiagramPreview } from '@/features/diagram-portal/flow-diagram-preview'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { TbExternalLink } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { ServiceDbSchema } from '../../api/service-db-v2'

export function SelectedDatabaseDiagramSection({
  db,
}: {
  db: ServiceDbSchema
}) {
  const orgId = useCurrentOrganization().id
  const diagramId = db.dbDiagramId
  const skip = !diagramId || !orgId

  const { data, loading } = useQuery(DIAGRAM_V2, {
    client: clientV2,
    variables: { orgId: orgId!, id: diagramId! },
    fetchPolicy: 'cache-first',
    skip,
  })

  const { data: contentData, loading: contentLoading } = useQuery(
    DIAGRAM_CONTENT_V2,
    {
      client: clientV2,
      variables: { orgId: orgId!, id: diagramId! },
      fetchPolicy: 'cache-first',
      skip,
    }
  )

  const diagramData = useMemo(() => {
    const content = contentData?.diagramContent?.content
    if (!content) return null

    const result = convertDiagramServerData(content)
    const resultNodes = result.nodes.map((node) => ({
      ...node,
      data: { ...node.data, isForcedOpen: true },
    }))

    return {
      ...result,
      nodes: resultNodes,
    }
  }, [contentData?.diagramContent?.content])

  if (!diagramId) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#939395]">
        No data model diagram linked to this database
      </div>
    )
  }

  if (loading || contentLoading) return <SectionLoader />

  if (!diagramData) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#939395]">
        No diagram found
      </div>
    )
  }

  return (
    <div className="relative isolate h-full w-full pt-4">
      <div className="border-stock flex h-full w-full overflow-hidden rounded-[1rem] border">
        <FlowDiagramPreview
          key={diagramId}
          data={diagramData}
          name={data?.diagram?.name ?? undefined}
        />
      </div>

      <Button
        asChild
        size="sm"
        preset="primary"
        className="absolute top-6 right-2 shadow-lg"
      >
        <Link to={`/diagram/${diagramId}`} target="_blank">
          <TbExternalLink />
          Open in Diagram Editor
        </Link>
      </Button>
    </div>
  )
}
