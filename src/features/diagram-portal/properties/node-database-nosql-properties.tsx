import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Code2, DatabaseIcon } from 'lucide-react'
import { useState } from 'react'
import {
  DynamoEditorSchema,
  JsonEditorSchema,
  MongoEditorSchema,
} from '../components/nosql-editor/nosql-schema'
import { useDatabaseTable } from '../hooks/use-database-table'
import { NodeDatabaseNosqlCode } from './node-database-nosql-code'
import { NodeDatabaseNosqlPropertiesUI } from './node-database-nosql-ui'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null
}

function getArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null
}

function getString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

export function NodeDatabaseNosqlProperties({
  databaseName,
  tableName,
}: {
  databaseName: string
  tableName: string
}) {
  const dbTable = useDatabaseTable(databaseName, tableName)
  const [isCodeMode, setIsCodeMode] = useState(false)

  return (
    <div className="relative">
      <div
        className={cn(
          'bg-card flex items-center justify-between gap-2 pt-2 pb-3',
          isCodeMode && 'sticky top-0 z-50'
        )}
      >
        <div className="flex items-center gap-2">
          <DatabaseIcon className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-semibold">
            {dbTable.dataSource?.dialect === 'dynamodb'
              ? 'DynamoDB Table'
              : dbTable.dataSource?.dialect === 'mongodb'
                ? 'MongoDB Collection'
                : 'JSON File'}
          </h3>
        </div>

        <Button
          preset={isCodeMode ? 'primary' : 'outline'}
          onClick={() => setIsCodeMode((prev) => !prev)}
          className={cn(
            'size-9 border-none! px-3!',
            !isCodeMode && 'bg-accent/60 hover:bg-accent'
          )}
        >
          <Code2 className="size-5" />
        </Button>
      </div>

      {isCodeMode ? (
        <NodeDatabaseNosqlCode
          value={
            dbTable.dataSource?.dialect === 'dynamodb'
              ? JSON.stringify(dbTable.dataSource?.sourceContent, null, 2)
              : JSON.stringify(dbTable.mongoCollectionSource, null, 2)
          }
          setValue={(value) => {
            if (!dbTable.dataSource) return
            const raw = value.trim()
            if (!raw) return

            let parsed: unknown
            try {
              parsed = JSON.parse(raw)
            } catch {
              return
            }

            if (dbTable.dataSource.dialect === 'dynamodb') {
              try {
                const next = DynamoEditorSchema.parse(parsed)
                dbTable.setDataSource({
                  sourceContent: next,
                  modifiedAt: Date.now(),
                })
              } catch {
                return
              }
              return
            }

            if (dbTable.dataSource.dialect === 'mongodb') {
              if (!dbTable.mongoCollectionSource) return
              const prev = MongoEditorSchema.safeParse(
                dbTable.dataSource.sourceContent
              )
              if (!prev.success) return

              const nextUnknown: unknown = {
                ...prev.data,
                collections: prev.data.collections.map((c) =>
                  c.id === dbTable.mongoCollectionSource?.id ? parsed : c
                ),
              }
              try {
                const next = MongoEditorSchema.parse(nextUnknown)
                dbTable.setDataSource({
                  sourceContent: next,
                  modifiedAt: Date.now(),
                })
              } catch {
                return
              }
              return
            }

            if (dbTable.dataSource.dialect === 'json') {
              const prevRec = getRecord(dbTable.dataSource.sourceContent)
              if (!prevRec) return
              const prevCollections = getArray(prevRec.collections)
              if (!prevCollections) return
              const collection0 =
                prevCollections.length > 0 ? prevCollections[0] : null
              const id0 =
                collection0 && getRecord(collection0)
                  ? getString(getRecord(collection0)?.id)
                  : null
              if (!id0) return

              const nextUnknown: unknown = {
                ...prevRec,
                collections: [parsed, ...prevCollections.slice(1)],
              }
              try {
                const next = JsonEditorSchema.parse(nextUnknown)
                dbTable.setDataSource({
                  sourceContent: next,
                  modifiedAt: Date.now(),
                })
              } catch {
                return
              }
            }
          }}
        />
      ) : (
        <NodeDatabaseNosqlPropertiesUI tableName={tableName} {...dbTable} />
      )}
    </div>
  )
}
