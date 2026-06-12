'use client'

import { useOrganizationContext } from '@/contexts'
import { CREATE_DIAGRAM_MUTATION } from '@/features/dashboard-diagrams/api/diagrams'
import {
  CREATE_SERVICE_DB_MUTATION,
  GET_SERVICE_DB_QUERY,
} from '@/features/services/api/service-db'
import { useServiceContext } from '@/features/services/contexts/service-context'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { ConfigureDbSchemaModal } from './configure-db-schema-modal'

interface SchemaUploadModalProps {
  onOpenChange: (open: boolean) => void
}

export function DBSchemaUploadModal({ onOpenChange }: SchemaUploadModalProps) {
  const { serviceId } = useServiceContext()
  const { organizationId } = useOrganizationContext()

  const [createDiagram] = useMutation(CREATE_DIAGRAM_MUTATION)
  const [createServiceDb] = useMutation(CREATE_SERVICE_DB_MUTATION, {
    awaitRefetchQueries: true,
    refetchQueries: [GET_SERVICE_DB_QUERY],
  })

  return (
    <ConfigureDbSchemaModal
      mode="upload"
      onSubmit={async ({ data, attachedSchema, componentFlowDiagram }) => {
        try {
          const diagramResult = await createDiagram({
            variables: {
              input: {
                organizationId,
                componentFlowDiagramName: `${data.dbName} Schema Diagram`,
                componentFlowDiagram: componentFlowDiagram,
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

          await createServiceDb({
            variables: {
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

          toast.success('Database schema uploaded successfully')
          onOpenChange(false)
        } catch (error) {
          console.error('Upload error:', error)
          toast.error(
            error instanceof Error ? error.message : 'Failed to upload schema'
          )
        }
      }}
    />
  )
}
