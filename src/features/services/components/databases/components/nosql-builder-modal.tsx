'use client'

import { clientV2 } from '@/api/client'
import { CREATE_DIAGRAM } from '@/features/dashboard-diagrams/api/diagrams'
import { NosqlEditorModal } from '@/features/diagram-portal/components/nosql-editor/nosql-editor-modal'
import { convertDiagramServerDataToString } from '@/features/diagram-portal/helpers/diagram-data'
import { DataSource } from '@/features/diagram-portal/types/db-flow'
import {
  CREATE_SERVICE_DB,
  SERVICE_DBS,
  toCreateServiceDBInput,
} from '@/features/services/api/service-db'
import { useServiceContext } from '@/features/services/contexts/service-context'
import { useCurrentOrganization } from '@/store/auth-store'
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
  const orgId = useCurrentOrganization().id
  const { serviceId } = useServiceContext()

  const listVars = { orgId: orgId!, serviceId }

  const [createDiagram] = useMutation(CREATE_DIAGRAM, { client: clientV2 })
  const [createServiceDb] = useMutation(CREATE_SERVICE_DB, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICE_DBS, variables: listVars }],
  })

  async function handleSchemaSubmit(dataSource: DataSource) {
    try {
      const { nodes, edges } = AstToUiConverter.toReactFlow(
        dataSource.schemaAst,
        dataSource.id
      )

      const diagramResult = await createDiagram({
        variables: {
          orgId: orgId!,
          input: {
            name: `${dataSource.name} Schema Diagram`,
            content: convertDiagramServerDataToString({
              nodes,
              edges,
              components: [],
              dataSources: [dataSource],
            }),
          },
        },
      })

      const diagramId = diagramResult.data?.createDiagram?.id
      if (!diagramId) {
        throw new Error('Failed to create diagram')
      }

      await createServiceDb({
        variables: {
          orgId: orgId!,
          serviceId,
          input: toCreateServiceDBInput({
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
          }),
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
