'use client'

import { apolloClientGQL } from '@/api/client'
import { CREATE_DIAGRAM } from '@/features/dashboard-diagrams/api/diagrams'
import {
  CREATE_SERVICE_DB,
  SERVICE_DBS,
  toCreateServiceDBInput,
} from '@/features/services/api/service-db'
import { useServiceContext } from '@/features/services/contexts/service-context'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { ConfigureDbSchemaModal } from './configure-db-schema-modal'

interface SchemaUploadModalProps {
  onOpenChange: (open: boolean) => void
}

export function DBSchemaUploadModal({ onOpenChange }: SchemaUploadModalProps) {
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id

  const listVars = { orgId: orgId!, serviceId }

  const [createDiagram] = useMutation(CREATE_DIAGRAM, {
    client: apolloClientGQL,
  })
  const [createServiceDb] = useMutation(CREATE_SERVICE_DB, {
    client: apolloClientGQL,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICE_DBS, variables: listVars }],
  })

  return (
    <ConfigureDbSchemaModal
      mode="upload"
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

          await createServiceDb({
            variables: {
              orgId: orgId!,
              serviceId,
              input: toCreateServiceDBInput({
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
              }),
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
