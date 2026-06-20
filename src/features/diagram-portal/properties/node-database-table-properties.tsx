import { clientV2 } from '@/api-v2/client'
import { SuperLogoLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  SERVICE_DB_V2,
  serviceDBToLegacy,
} from '@/features/services/api/service-db-v2'
import { useEffectState } from '@/hooks/use-effect-state'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { ColumnAST, ConstraintAST, TableAST } from '@uigraph/sdk'
import { Code2, DatabaseIcon, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDatabaseTable } from '../hooks/use-database-table'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { TDatabaseTableSQLNode } from '../nodes/database-table-node-sql'
import { DatabaseColumnInput } from './components/database-column-input'
import { NodeDatabaseNosqlCode } from './node-database-nosql-code'
import { NodeDatabaseNosqlProperties } from './node-database-nosql-properties'
import { NodeDatabaseNosqlPropertiesUI } from './node-database-nosql-ui'

export function NodeDatabaseTableProperties() {
  const { data } = useSingleSelectedNode<TDatabaseTableSQLNode>()

  if (data?.localTable) {
    return <NodeDatabaseTablePropertiesLocalSource />
  }

  if (data?.serviceTable) {
    return <NodeDatabaseTablePropertiesRemoteSource />
  }

  return null
}

function NodeDatabaseTablePropertiesLocalSource() {
  const { data } = useSingleSelectedNode<TDatabaseTableSQLNode>()
  const { table, dataSource, setTable } = useDatabaseTable(
    data?.localTable!.baseId,
    data?.localTable!.tableId
  )

  const [localTable, setLocalTable] = useEffectState<TableAST | null>(
    table ?? null
  )

  if (!localTable) return null

  if (
    dataSource?.dialect === 'mongodb' ||
    dataSource?.dialect === 'dynamodb' ||
    dataSource?.dialect === 'json'
  ) {
    return (
      <NodeDatabaseNosqlProperties
        baseId={data?.localTable!.baseId}
        tableId={data?.localTable!.tableId}
      />
    )
  }

  const primaryKeyConstraint = localTable.constraints.find(
    (c) => c.type === 'primary_key'
  )
  const primaryKeys = primaryKeyConstraint?.columns ?? []
  const foreignKeyConstraints = localTable.constraints.filter(
    (c) => c.type === 'foreign_key'
  )

  function handleAddColumn() {
    const newColumn: ColumnAST = {
      type: 'column' as const,
      name: `new_column_${(localTable?.columns?.length ?? 0) + 1}`,
      dataType: { name: 'VARCHAR', parameters: [255] },
      nullable: true,
    }

    const updatedTable = {
      ...localTable,
      columns: [...(localTable?.columns ?? []), newColumn],
    }

    setTable(updatedTable)
    setLocalTable((prev) => (prev ? { ...prev, ...updatedTable } : null))
    toast.success('Column added')
  }

  function handleRemoveColumn(columnName: string) {
    if (!localTable) return
    if ((localTable?.columns?.length ?? 0) <= 1) {
      toast.error('Cannot remove the last column')
      return
    }

    const updatedColumns = (localTable?.columns ?? []).filter(
      (col) => col.name !== columnName
    )

    const updatedConstraints = (localTable?.constraints ?? []).filter(
      (constraint) =>
        !('columns' in constraint && constraint.columns.includes(columnName))
    )

    const updatedTable: TableAST = {
      ...localTable,
      columns: updatedColumns,
      constraints: updatedConstraints,
    }

    setLocalTable((prev) => (prev ? { ...prev, ...updatedTable } : null))
    setTable(updatedTable)
    toast.success('Column removed')
  }

  function handleUpdateColumn(
    oldName: string,
    updates: {
      name?: string
      type?: string
      nullable?: boolean
      isPrimaryKey?: boolean
    }
  ) {
    if (!localTable) return
    const column = localTable?.columns?.find((c) => c.name === oldName)
    if (!column) return

    const newName = updates.name ?? column.name

    let dataType = column.dataType
    if (updates.type) {
      const parts = updates.type.split('(')
      const typeName = parts[0]
      const parameters =
        parts[1]
          ?.replace(')', '')
          .split(',')
          .map((p) => {
            const trimmed = p.trim()
            const num = Number(trimmed)
            return Number.isNaN(num) ? trimmed : num
          }) ?? []
      dataType = { name: typeName, parameters }
    }

    const updatedColumns = (localTable?.columns ?? []).map((col) =>
      col.name === oldName
        ? {
            ...col,
            name: newName,
            dataType,
            nullable: updates.nullable ?? col.nullable,
          }
        : col
    )

    const shouldBePrimaryKey =
      updates.isPrimaryKey ?? primaryKeys.includes(oldName)

    const updatedConstraints = (localTable?.constraints ?? [])
      .map((constraint) => {
        if (constraint.type === 'primary_key') {
          const columns = constraint.columns.filter((col) => col !== oldName)
          if (shouldBePrimaryKey && !columns.includes(newName)) {
            columns.push(newName)
          }
          return columns.length ? { ...constraint, columns } : null
        }

        if (constraint.type === 'foreign_key') {
          return {
            ...constraint,
            columns: constraint.columns.map((col) =>
              col === oldName ? newName : col
            ),
          }
        }

        return constraint
      })
      .filter((constraint): constraint is ConstraintAST => Boolean(constraint))

    const updatedTable: TableAST = {
      ...localTable,
      columns: updatedColumns,
      constraints: updatedConstraints,
    }

    setLocalTable((prev) => (prev ? { ...prev, ...updatedTable } : null))
    setTable(updatedTable)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold">Database Table</h3>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Table Name</Label>
          <Input
            className="!h-11 rounded-[0.8rem] shadow-none"
            value={localTable.name}
            onChange={(e) => {
              const updatedTable = { ...localTable, name: e.target.value }
              setLocalTable(updatedTable)
              setTable(updatedTable)
            }}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">
            Columns ({localTable.columns.length})
          </Label>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={handleAddColumn}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {localTable.columns.map((column) => {
            const isPrimaryKey = primaryKeys.includes(column.name)
            const isForeignKey = foreignKeyConstraints.some((fk) =>
              fk.columns.includes(column.name)
            )

            return (
              <DatabaseColumnInput
                key={column.name}
                column={{
                  name: column.name,
                  type: column.dataType.name,
                  nullable: column.nullable,
                  isPrimaryKey,
                  isForeignKey,
                }}
                triggerRemove={() => handleRemoveColumn(column.name)}
                triggerChanges={(updates) =>
                  handleUpdateColumn(column.name, updates)
                }
              />
            )
          })}
        </div>
      </div>

      {primaryKeys.length > 0 && (
        <>
          <Separator />
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Primary Keys</Label>
            <div className="flex flex-wrap gap-1">
              {primaryKeys.map((pk) => (
                <span
                  key={pk}
                  className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 font-mono text-xs text-amber-700"
                >
                  {pk}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {foreignKeyConstraints.length > 0 && (
        <>
          <Separator />
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Foreign Keys</Label>
            <div className="space-y-1">
              {foreignKeyConstraints.flatMap((fk, fkIndex) =>
                fk.columns.map((columnName, colIndex) => (
                  <div
                    key={`${fkIndex}-${colIndex}`}
                    className="rounded bg-blue-50 px-2 py-1 text-xs"
                  >
                    <span className="font-mono text-blue-700">
                      {columnName}
                    </span>
                    <span className="text-gray-500"> → </span>
                    <span className="font-mono text-blue-700">
                      {fk.referencedTable}.
                      {fk.referencedColumns[colIndex] ??
                        fk.referencedColumns[0]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function NodeDatabaseTablePropertiesRemoteSource() {
  const { data } = useSingleSelectedNode<TDatabaseTableSQLNode>()
  const serviceTable = data?.serviceTable
  const orgId = useCurrentOrganization().id
  const [isCodeMode, setIsCodeMode] = useState(false)
  const { data: serviceDbData, loading } = useQuery(SERVICE_DB_V2, {
    client: clientV2,
    variables: {
      orgId: orgId!,
      serviceId: serviceTable?.serviceId ?? '',
      id: serviceTable?.serviceDbId ?? '',
    },
    skip: !orgId || !serviceTable?.serviceId || !serviceTable?.serviceDbId,
    fetchPolicy: 'cache-first',
  })

  const serviceDb = serviceDbData?.serviceDB
    ? serviceDBToLegacy(serviceDbData.serviceDB)
    : undefined

  // Parse noSQLSchema for NoSQL dialects
  const noSQLContent = useMemo(() => {
    if (!serviceDb?.noSQLSchema) return null
    try {
      const parsed =
        typeof serviceDb.noSQLSchema === 'string'
          ? JSON.parse(serviceDb.noSQLSchema)
          : serviceDb.noSQLSchema
      if (serviceDb.dialect === 'dynamodb') return parsed?.dynamo?.table ?? null
      if (serviceDb.dialect === 'mongodb')
        return parsed?.mongo?.collections ?? null
      return null
    } catch {
      return null
    }
  }, [serviceDb?.noSQLSchema, serviceDb?.dialect])

  const columns = useMemo(() => {
    const table = serviceDb?.tables?.find(
      (table) => table?.name === serviceTable?.tableName
    )
    return (
      table?.columns?.map((column) => ({
        name: column?.name ?? '',
        type: column?.type ?? 'unknown',
      })) ?? []
    )
  }, [serviceDb, serviceTable?.tableName])

  const remoteNote = (
    <div className="rounded bg-red-50 p-2 text-xs text-red-700">
      <strong className="font-semibold">Note:</strong> This is a remote source
      and you cannot edit it directly. To edit it, use the service database data
      source editor in the service details panel.
    </div>
  )

  if (loading) {
    return (
      <div className="text-paragraph flex h-full flex-col items-center justify-center gap-4 py-12">
        <SuperLogoLoader size="xs" />
        Loading table...
      </div>
    )
  }

  // NoSQL panel (DynamoDB / MongoDB) — reuse the editable UI in read-only mode
  if (
    (serviceDb?.dialect === 'dynamodb' || serviceDb?.dialect === 'mongodb') &&
    noSQLContent
  ) {
    const mongoCollectionSource =
      serviceDb.dialect === 'mongodb'
        ? (() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cols = Array.isArray((noSQLContent as any)?.collections)
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (noSQLContent as any).collections
              : Array.isArray(noSQLContent)
                ? noSQLContent
                : null
            return (
              cols?.find(
                (c: { name?: string }) => c.name === serviceTable?.tableName
              ) ?? null
            )
          })()
        : null

    const dialectLabel =
      serviceDb.dialect === 'dynamodb' ? 'DynamoDB Table' : 'MongoDB Collection'
    const codeValue =
      serviceDb.dialect === 'dynamodb'
        ? JSON.stringify(noSQLContent, null, 2)
        : JSON.stringify(mongoCollectionSource, null, 2)

    return (
      <div className="relative">
        <div
          className={cn(
            'flex items-center justify-between gap-2 bg-white pt-2 pb-3',
            isCodeMode && 'sticky top-0 z-50'
          )}
        >
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-semibold">{dialectLabel}</h3>
          </div>
          <Button
            preset={isCodeMode ? 'primary' : 'outline'}
            onClick={() => setIsCodeMode((prev) => !prev)}
            className={cn(
              'size-9 border-none! px-3!',
              !isCodeMode && 'bg-gray-200/60 hover:bg-gray-300/60'
            )}
          >
            <Code2 className="size-5" />
          </Button>
        </div>

        {isCodeMode ? (
          <NodeDatabaseNosqlCode value={codeValue ?? ''} setValue={() => {}} />
        ) : (
          <div className="space-y-3">
            <NodeDatabaseNosqlPropertiesUI
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              table={{ name: serviceTable?.tableName ?? '' } as any}
              tableId={serviceTable?.tableName ?? ''}
              dataSource={{
                id: serviceTable?.serviceDbId ?? '',
                name: serviceTable?.tableName ?? '',
                sourceType: 'manual' as const,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sourceContent: noSQLContent as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dialect: serviceDb.dialect as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                schemaAst: { tables: [], dialect: serviceDb.dialect as any },
                createdAt: 0,
                modifiedAt: null,
              }}
              mongoCollectionSource={mongoCollectionSource}
              setDataSource={() => {}}
              setTable={() => {}}
              readOnly
            />
            <Separator />
            {remoteNote}
          </div>
        )}
      </div>
    )
  }

  // SQL fallback
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Columns</Label>
        {columns.length ? (
          <div className="space-y-1">
            {columns.map((column) => (
              <div
                key={column.name}
                className="flex items-center justify-between rounded bg-slate-100 px-3 py-1 text-xs text-slate-800"
              >
                <span className="font-mono">{column.name}</span>
                <span className="text-slate-500">{column.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-gray-500">
            No column information is available.
          </p>
        )}
      </div>

      <Separator />
      {remoteNote}
    </div>
  )
}
