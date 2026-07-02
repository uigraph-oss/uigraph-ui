import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, Database, Hash, Table2 } from 'lucide-react'
import { ReactNode } from 'react'
import { BsCollection } from 'react-icons/bs'
import { ServiceDbSchema } from '../../api/service-db'
import { DbTypeBadge } from './components/db-type-badge'
import {
  getSchemaSummaryStats,
  getSchemaUpdatedDate,
  SchemaViewKind,
  SummaryStat,
} from './schema-view-utils'

function SummaryStatCard({ stat }: { stat: SummaryStat }) {
  return (
    <div className="rounded-xl border border-[#2A3242] p-4">
      <div className="flex items-center gap-2 text-[#828DA3]">
        {stat.label === 'Database' ? (
          <Database className="h-4 w-4" />
        ) : stat.label === 'Tables' || stat.label === 'Table' ? (
          <Table2 className="h-4 w-4" />
        ) : stat.label === 'Collections' ? (
          <BsCollection className="h-4 w-4" />
        ) : (
          <Hash className="h-4 w-4" />
        )}
        <span className="text-xs">{stat.label}</span>
      </div>
      <div className="mt-2 truncate text-[1.15rem] font-semibold text-[#F4F7FC]">
        {stat.value}
      </div>
    </div>
  )
}

export function SchemaViewShell({
  db,
  kind,
  sectionTitle,
  sectionIcon,
  children,
}: {
  db: ServiceDbSchema
  kind: SchemaViewKind
  sectionTitle: string
  sectionIcon: ReactNode
  children: ReactNode
}) {
  const stats = getSchemaSummaryStats(db, kind)
  const updatedDate = getSchemaUpdatedDate(db)

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
        <DbTypeBadge type={db.dbType ?? db.dialect} />
      </div>

      <div className="rounded-[1.4525rem] bg-[#141925] p-5 ring-1 ring-[#2A3242]">
        <div
          className={cn(
            'grid gap-4',
            stats.length === 4
              ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2'
          )}
        >
          {stats.map((stat) => (
            <SummaryStatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>

      <div className="rounded-[1.4525rem] bg-[#141925] ring-1 ring-[#2A3242]">
        <div className="border-b border-[#2A3242] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 text-[1.075rem] font-semibold text-[#F4F7FC]">
              {sectionIcon}
              {sectionTitle}
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

        {children}
      </div>
    </div>
  )
}

export function SchemaEmptyState({ kind }: { kind: SchemaViewKind }) {
  const message =
    kind === 'dynamodb'
      ? 'No DynamoDB table schema found for this database.'
      : kind === 'mongodb'
        ? 'No MongoDB collections found for this database.'
        : kind === 'json-tables' || kind === 'json-collections'
          ? 'No JSON collections found for this database.'
          : 'No schema data found for this database.'

  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <p className="text-sm font-medium text-[#F4F7FC]">No schema to display</p>
      <p className="max-w-md text-sm text-[#828DA3]">{message}</p>
    </div>
  )
}
