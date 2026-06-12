'use client'

import { useOrganizationContext } from '@/contexts'
import { CREATE_DIAGRAM_MUTATION } from '@/features/dashboard-diagrams/api/diagrams'
import { useServiceDbContext } from '@/features/services/contexts/service-db-context'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { ConfigureDbSchemaModal } from './configure-db-schema-modal'

export function DBVersionPublishModal({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  const { dbId, serviceId, createServiceDbVersion } = useServiceDbContext()
  const { organizationId } = useOrganizationContext()

  const [createDiagram] = useMutation(CREATE_DIAGRAM_MUTATION)

  return (
    <ConfigureDbSchemaModal
      mode="publish"
      onSubmit={async ({ data, attachedSchema, componentFlowDiagram }) => {
        try {
          const diagramResult = await createDiagram({
            variables: {
              input: {
                organizationId,
                componentFlowDiagram,
                componentFlowDiagramName: `${data.dbName} Schema Diagram`,
              },
            },
          })

          const diagramId = diagramResult.data?.v1CreateDiagram?.diagramId
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
            variables: {
              serviceDBId: dbId,
              input: {
                serviceId,
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
