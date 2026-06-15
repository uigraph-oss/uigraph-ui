'use client'

import { clientV2 } from '@/api-v2/client'
import { CREATE_DIAGRAM_V2 } from '@/features/dashboard-diagrams/api/diagrams-v2'
import { useServiceDbContext } from '@/features/services/contexts/service-db-context'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { ConfigureDbSchemaModal } from './configure-db-schema-modal'

export function DBVersionPublishModal({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  const { createServiceDbVersion } = useServiceDbContext()
  const orgId = useCurrentOrganization().id

  const [createDiagram] = useMutation(CREATE_DIAGRAM_V2, { client: clientV2 })

  return (
    <ConfigureDbSchemaModal
      mode="publish"
      onSubmit={async ({ data, attachedSchema, componentFlowDiagram }) => {
        try {
          const diagramResult = await createDiagram({
            variables: {
              orgId: orgId!,
              input: {
                name: `${data.dbName} Schema Diagram`,
                content: componentFlowDiagram,
              },
            },
          })

          const diagramId = diagramResult.data?.createDiagram?.id
          if (!diagramId) {
            throw new Error('Failed to create diagram')
          }

          const mongoCollections =
            attachedSchema.sourceContent?.dialect === 'mongodb'
              ? (attachedSchema.sourceContent?.collections ?? [])
              : undefined

          const dynamoTable =
            attachedSchema.sourceContent?.dialect === 'dynamodb'
              ? attachedSchema.sourceContent
              : undefined

          await createServiceDbVersion({
            input: {
              dbName: data.dbName,
              dbType: data.dbType,
              dialect: data.dbType,
              dbDiagramId: diagramId,

              tables: attachedSchema.sourceContent
                ? undefined
                : attachedSchema.ast?.tables.map((table) => ({
                    name: table.name,
                    columns: table.columns.map((col) => ({
                      name: col.name,
                      type: col.dataType.name,
                      nullable: col.nullable,
                      description: col.comment || null,
                      isPrimaryKey: table.constraints.some(
                        (c) =>
                          c.type === 'primary_key' &&
                          c.columns.includes(col.name)
                      ),
                    })),
                  })),

              noSQLSchema: {
                dynamo: dynamoTable ? { table: dynamoTable } : undefined,
                mongo: mongoCollections
                  ? { collections: mongoCollections }
                  : undefined,
              },
            },
          })

          toast.success('Database version published successfully')
          onOpenChange(false)
        } catch (error) {
          console.error('Upload error:', error)
          toast.error(
            error instanceof Error ? error.message : 'Failed to publish version'
          )
        }
      }}
    />
  )
}
