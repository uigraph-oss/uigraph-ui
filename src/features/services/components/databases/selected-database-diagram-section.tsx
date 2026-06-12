import { GT } from '@/api'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { GET_DIAGRAM_QUERY } from '@/features/diagram-portal/api'
import { FlowDiagramPreview } from '@/features/diagram-portal/flow-diagram-preview'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { TbExternalLink } from 'react-icons/tb'
import { Link } from 'react-router-dom'

export function SelectedDatabaseDiagramSection({ db }: { db: GT.ServiceDb }) {
  const { data, loading } = useQuery(GET_DIAGRAM_QUERY, {
    variables: { diagramId: db.dbDiagramId! },
    fetchPolicy: 'cache-first',
    skip: !db.dbDiagramId,
  })

  const diagramData = useMemo(() => {
    const diagram = data?.v1GetDiagram
    if (!diagram) return null

    const result = convertDiagramServerData(diagram.componentFlowDiagram)
    const resultNodes = result.nodes.map((node) => ({
      ...node,
      data: { ...node.data, isForcedOpen: true },
    }))

    return {
      ...result,
      nodes: resultNodes,
    }
  }, [data?.v1GetDiagram])

  if (loading) return <SectionLoader />

  if (!diagramData) return <div>No diagram found</div>

  return (
    <div className="relative isolate h-full w-full pt-4">
      <div className="border-stock flex h-full w-full overflow-hidden rounded-[1rem] border">
        <FlowDiagramPreview
          key={db.dbDiagramId}
          data={diagramData}
          name={data?.v1GetDiagram?.componentFlowDiagramName}
        />
      </div>

      <Button
        asChild
        size="sm"
        preset="primary"
        className="absolute top-6 right-2 shadow-lg"
      >
        <Link to={`/diagram/${db.dbDiagramId}`} target="_blank">
          <TbExternalLink />
          Open in Diagram Editor
        </Link>
      </Button>
    </div>
  )
}
