'use client'

import { useOrganizationContext } from '@/contexts'
import { CREATE_DIAGRAM_MUTATION } from '@/features/dashboard-diagrams/api/diagrams'
import { NosqlEditorModal } from '@/features/diagram-portal/components/nosql-editor/nosql-editor-modal'
import { convertDiagramServerDataToString } from '@/features/diagram-portal/helpers/diagram-data'
import { DataSource } from '@/features/diagram-portal/types/db-flow'
import {
  CREATE_SERVICE_DB_MUTATION,
  GET_SERVICE_DB_QUERY,
} from '@/features/services/api/service-db'
import { useServiceContext } from '@/features/services/contexts/service-context'
import { useMutation } from '@apollo/client'
import { AstToUiConverter } from '@uigraph/sdk'
import { toast } from 'sonner'

export function NosqlBuilderModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { organizationId } = useOrganizationContext()
  const { serviceId } = useServiceContext()

  const [createDiagram] = useMutation(CREATE_DIAGRAM_MUTATION)
  const [createServiceDb] = useMutation(CREATE_SERVICE_DB_MUTATION, {
    awaitRefetchQueries: true,
    refetchQueries: [GET_SERVICE_DB_QUERY],
  })

  async function handleSchemaSubmit(dataSource: DataSource) {
    try {
      const { nodes, edges } = AstToUiConverter.toReactFlow(
        dataSource.schemaAst,
        dataSource.id
      )

      const diagramResult = await createDiagram({
        variables: {
          input: {
            organizationId,
            componentFlowDiagramName: `${dataSource.name} Schema Diagram`,
            componentFlowDiagram: convertDiagramServerDataToString({
              nodes,
              edges,
              components: [],
              dataSources: [
                {
                  ...dataSource,
                },
              ],
            }),
          },
        },
      })

      const diagramId = diagramResult.data?.v1CreateDiagram?.diagramId
      if (!diagramId) {
        throw new Error('Failed to create diagram')
      }

      await createServiceDb({
        variables: {
          input: {
            serviceId,
            dbName: dataSource.name,
            dbType: dataSource.dialect,
            dialect: dataSource.dialect,
            dbDiagramId: diagramId,
            noSQLSchema: {
              mongo:
                dataSource.sourceContent?.dialect === 'mongodb'
                  ? { collections: dataSource.sourceContent?.collections ?? [] }
                  : undefined,

              dynamo:
                dataSource.sourceContent?.dialect === 'dynamodb'
                  ? { table: dataSource.sourceContent }
                  : undefined,
            },
          },
        },
      })

      toast.success('Database schema created successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('NoSQL builder error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to create database'
      )
    }
  }

  return (
    <NosqlEditorModal
      open={open}
      onOpenChange={onOpenChange}
      onSchemaSubmit={handleSchemaSubmit}
    />
  )
}
