import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { arrayNonNullable } from 'daily-code'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, Database, Hash, Table2 } from 'lucide-react'
import { BsCollection } from 'react-icons/bs'
import { CiViewTable } from 'react-icons/ci'
import { ServiceDbSchema } from '../../api/service-db'
import { RenderDynamoTable } from './components/render-dynamo-table'
import { RenderMongoCollections } from './components/render-mongo-collections'
import { RenderSQLTable } from './components/render-sql-table'

export function SelectedDatabaseSchemaSection({ db }: { db: ServiceDbSchema }) {
  const tables = arrayNonNullable(db.tables)
  const totalColumns = tables.reduce(
    (sum, t) => sum + (t?.columns?.length ?? 0),
    0
  )
  const totalIndexes = tables.reduce(
    (sum, t) => sum + (t?.indexes?.length ?? 0),
    0
  )

  const updatedDate = db.updatedAt
    ? new Date(db.updatedAt)
    : db.createdAt
      ? new Date(db.createdAt)
      : null

  function getTypeBadgeClass(type?: string | null) {
    const value = type?.toLowerCase()
    if (value === 'postgresql' || value === 'postgres')
      return 'bg-blue-100 text-blue-800'
    if (value === 'mysql') return 'bg-amber-100 text-amber-800'
    if (value === 'mongodb' || value === 'document')
      return 'bg-emerald-100 text-emerald-800'
    if (value === 'dynamodb') return 'bg-purple-100 text-purple-800'
    if (value === 'sqlite') return 'bg-green-100 text-green-800'
    return 'bg-[#1E2533] text-[#F4F7FC]'
  }

  const sqlTablesContent = db.tables != null && (
    <RenderSQLTable tables={tables} />
  )
  const dynamoTablesContent = db.noSQLSchema?.dynamo?.table != null && (
    <RenderDynamoTable tables={db.noSQLSchema?.dynamo?.table} />
  )
  const mongoCollectionsContent = db.noSQLSchema?.mongo?.collections !=
    null && (
    <RenderMongoCollections collections={db.noSQLSchema?.mongo?.collections} />
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[1.385rem] font-semibold text-[#F4F7FC]">
            {db.dbName ?? 'Untitled Database'}
          </h3>
          <p className="text-sm text-[#828DA3]">
            Overview of the selected database schema
          </p>
        </div>
        <Badge className={cn('text-xs', getTypeBadgeClass(db.dbType))}>
          {db.dbType ?? 'unknown'}
        </Badge>
      </div>

      <div className="rounded-[1.4525rem] bg-[#141925] p-5 ring-1 ring-[#2A3242]">
        <div className="grid grid-flow-col gap-4">
          <div className="rounded-xl border border-[#2A3242] p-4">
            <div className="flex items-center gap-2 text-[#828DA3]">
              <Database className="h-4 w-4" />
              <span className="text-xs">Database</span>
            </div>
            <div className="mt-2 text-[1.15rem] font-semibold text-[#F4F7FC]">
              {db.dbName ?? 'Untitled'}
            </div>
          </div>

          <div className="rounded-xl border border-[#2A3242] p-4">
            <div className="flex items-center gap-2 text-[#828DA3]">
              <Table2 className="h-4 w-4" />

              <span className="text-xs">
                {dynamoTablesContent
                  ? 'Table'
                  : mongoCollectionsContent
                    ? 'Collections'
                    : 'Tables'}
              </span>
            </div>

            <div className="mt-2 text-[1.15rem] font-semibold text-[#F4F7FC]">
              {dynamoTablesContent
                ? db.noSQLSchema?.dynamo?.table
                  ? 1
                  : 0
                : mongoCollectionsContent
                  ? (db.noSQLSchema?.mongo?.collections?.length ?? 0)
                  : tables.length}
            </div>
          </div>

          <div className="rounded-xl border border-[#2A3242] p-4">
            <div className="flex items-center gap-2 text-[#828DA3]">
              <Hash className="h-4 w-4" />
              <span className="text-xs">Columns</span>
            </div>
            <div className="mt-2 text-[1.15rem] font-semibold text-[#F4F7FC]">
              {totalColumns}
            </div>
          </div>

          <div className="rounded-xl border border-[#2A3242] p-4">
            <div className="flex items-center gap-2 text-[#828DA3]">
              <Hash className="h-4 w-4" />
              <span className="text-xs">Indexes</span>
            </div>
            <div className="mt-2 text-[1.15rem] font-semibold text-[#F4F7FC]">
              {totalIndexes}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.4525rem] bg-[#141925] ring-1 ring-[#2A3242]">
        <div className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-[1.075rem] font-semibold text-[#F4F7FC]">
              {dynamoTablesContent ? (
                <>
                  <CiViewTable className="size-5" /> Table
                </>
              ) : mongoCollectionsContent ? (
                <>
                  <BsCollection className="size-4" /> Collections
                </>
              ) : (
                <>
                  <CiViewTable className="size-5" /> Tables
                </>
              )}
            </h4>

            {updatedDate && (
              <div className="flex items-center gap-2 text-sm text-[#828DA3]">
                <Calendar className="h-4 w-4" />
                <span>
                  Updated{' '}
                  {formatDistanceToNow(updatedDate, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>

        {sqlTablesContent}
        {dynamoTablesContent}
        {mongoCollectionsContent}
      </div>
    </div>
  )
}
