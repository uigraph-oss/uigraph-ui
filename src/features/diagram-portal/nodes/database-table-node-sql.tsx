import { Node, NodeProps, NodeResizeControl } from '@xyflow/react'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'
import { useDatabaseTable } from '../hooks/use-database-table'
import { useResolveServiceDb } from '../hooks/use-resolve-service-db'
import { DataNodeCode } from './components/data-node-code'
import { DataNodeNoSQLContent } from './components/data-node-nosql'
import {
  DatabaseTableNodeCore,
  DatabaseTableNodeInvalid,
  DatabaseTableNodeShell,
} from './database-table-node-core'

export interface DatabaseTableSQLNodeData extends Record<string, unknown> {
  style?: {
    baseColor?: string
  }

  isForcedOpen?: boolean

  localTable?: {
    databaseName: string
    tableName: string
  }

  serviceTable?: {
    serviceName: string
    databaseName: string
    tableName: string
  }
}

export type TDatabaseTableSQLNode = Node<
  DatabaseTableSQLNodeData,
  'databaseTableSQL'
>

export function DatabaseTableSQLNode(props: NodeProps<TDatabaseTableSQLNode>) {
  if (props.data.localTable) {
    return <DatabaseTableNodeLocalSource {...props} />
  }

  if (props.data.serviceTable) {
    return <DatabaseTableNodeRemoteSource {...props} />
  }

  return null
}

function DatabaseTableNodeLocalSource({
  data,
  selected,
}: NodeProps<TDatabaseTableSQLNode>) {
  const [isCodeMode, setIsCodeMode] = useState(false)
  const { table, dataSource, mongoCollectionSource } = useDatabaseTable(
    data.localTable!.databaseName,
    data.localTable!.tableName
  )

  if (
    dataSource?.dialect === 'mongodb' ||
    dataSource?.dialect === 'dynamodb' ||
    dataSource?.dialect === 'json'
  ) {
    return (
      <>
        {selected && isCodeMode && (
          <>
            <NodeResizeControl
              resizeDirection="horizontal"
              position="top-left"
              minWidth={400}
            />
            <NodeResizeControl
              resizeDirection="horizontal"
              position="top-right"
              minWidth={400}
            />
            <NodeResizeControl
              resizeDirection="horizontal"
              position="bottom-left"
              minWidth={400}
            />
            <NodeResizeControl
              resizeDirection="horizontal"
              position="bottom-right"
              minWidth={400}
            />
          </>
        )}

        <DatabaseTableNodeShell
          hasCodeMode
          codeModeEnabled={isCodeMode}
          onCodeModeEnable={() => setIsCodeMode((prev) => !prev)}
          selected={selected}
          baseColor={data.style?.baseColor}
          tableName={table?.name || 'Unknown Table'}
        >
          {isCodeMode ? (
            <DataNodeCode
              table={table!}
              dataSource={dataSource}
              mongoCollectionSource={mongoCollectionSource!}
            />
          ) : (
            <DataNodeNoSQLContent
              table={table!}
              dataSource={dataSource}
              isForcedOpen={data.isForcedOpen ?? false}
              mongoCollectionSource={mongoCollectionSource!}
            />
          )}
        </DatabaseTableNodeShell>
      </>
    )
  }

  if (!table) {
    return (
      <DatabaseTableNodeInvalid
        selected={selected}
        tableName={data.localTable?.tableName ?? 'Unknown Table'}
        isLoading={false}
        style={data.style}
      />
    )
  }

  const primaryKeyConstraint = table.constraints.find(
    (constraint) => constraint.type === 'primary_key'
  )
  const primaryKeys =
    primaryKeyConstraint?.columns ||
    table.columns.filter((col) => col.autoIncrement).map((col) => col.name)

  const foreignKeyConstraints = table.constraints.filter(
    (constraint) => constraint.type === 'foreign_key'
  )
  const foreignKeys = foreignKeyConstraints.flatMap((fk) =>
    fk.columns.map((columnName, columnIndex) => ({
      columnName,
      referencedTable: fk.referencedTable,
      referencedColumn:
        fk.referencedColumns[columnIndex] ?? fk.referencedColumns[0],
    }))
  )

  const columns = table.columns.map((col) => ({
    name: col.name,
    type: col.dataType.name,
    isPrimaryKey: primaryKeys.includes(col.name),
    isForeignKey: foreignKeys.some((fk) => fk.columnName === col.name),
    nullable: col.nullable,
  }))

  return (
    <DatabaseTableNodeCore
      indexes={table.indexes.map((index) => ({
        name: index.name,
        columns: index.columns.map((col) => col.name),
        unique: index.unique,
      }))}
      selected={selected}
      tableName={table.name}
      style={data.style}
      columns={columns}
      primaryKeys={primaryKeys}
      foreignKeys={foreignKeys}
    />
  )
}

function DatabaseTableNodeRemoteSource({
  data,
  selected,
}: NodeProps<TDatabaseTableSQLNode>) {
  const { serviceName, databaseName, tableName } = data.serviceTable!

  const { serviceDb, loading } = useResolveServiceDb(serviceName, databaseName)

  const [isCodeMode, setIsCodeMode] = useState(false)

  // For NoSQL dialects parse noSQLSchema to get the raw schema content.
  // noSQLSchema may already be a parsed object (Apollo/GraphQL JSON scalar) or a string.
  const noSQLSourceContent = useMemo(() => {
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

  // For MongoDB: find the specific collection by tableName
  const mongoCollectionSource = useMemo(() => {
    if (serviceDb?.dialect !== 'mongodb' || !noSQLSourceContent) return null
    const cols = Array.isArray(noSQLSourceContent?.collections)
      ? noSQLSourceContent.collections
      : Array.isArray(noSQLSourceContent)
        ? noSQLSourceContent
        : null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cols?.find((c: any) => c.name === tableName) ?? null
  }, [serviceDb?.dialect, noSQLSourceContent, tableName])

  const table = useMemo(() => {
    if (!serviceDb?.tables?.length) return null
    const t = serviceDb.tables.find((t) => t?.name === tableName)
    if (!t) return null
    return {
      name: t.name ?? '',
      columns: arrayNonNullable(t.columns).map((column) => ({
        name: column?.name ?? '',
        type: column?.type ?? '',
        isPrimaryKey: column?.isPrimaryKey ?? false,
        isForeignKey: false,
        nullable: column?.nullable ?? false,
      })),
    }
  }, [serviceDb, tableName])

  if (loading || (!noSQLSourceContent && !table)) {
    return (
      <DatabaseTableNodeInvalid
        selected={selected}
        tableName={tableName}
        isLoading={loading}
        style={data.style}
      />
    )
  }

  if (noSQLSourceContent) {
    const noSQLDataSource = {
      id: serviceDb?.serviceDBId ?? '',
      name: tableName,
      sourceType: 'manual' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sourceContent: noSQLSourceContent as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dialect: serviceDb!.dialect as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schemaAst: { tables: [], dialect: serviceDb!.dialect as any },
      createdAt: 0,
      modifiedAt: null,
    }
    return (
      <>
        {selected && isCodeMode && (
          <>
            <NodeResizeControl
              resizeDirection="horizontal"
              position="top-left"
              minWidth={400}
            />
            <NodeResizeControl
              resizeDirection="horizontal"
              position="top-right"
              minWidth={400}
            />
            <NodeResizeControl
              resizeDirection="horizontal"
              position="bottom-left"
              minWidth={400}
            />
            <NodeResizeControl
              resizeDirection="horizontal"
              position="bottom-right"
              minWidth={400}
            />
          </>
        )}
        <DatabaseTableNodeShell
          hasCodeMode
          codeModeEnabled={isCodeMode}
          onCodeModeEnable={() => setIsCodeMode((prev) => !prev)}
          selected={selected}
          baseColor={data.style?.baseColor}
          tableName={tableName}
        >
          {isCodeMode ? (
            <DataNodeCode
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              table={null as any}
              dataSource={noSQLDataSource}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mongoCollectionSource={mongoCollectionSource as any}
            />
          ) : (
            <DataNodeNoSQLContent
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              table={null as any}
              dataSource={noSQLDataSource}
              isForcedOpen={data.isForcedOpen ?? false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mongoCollectionSource={mongoCollectionSource as any}
            />
          )}
        </DatabaseTableNodeShell>
      </>
    )
  }

  return (
    <DatabaseTableNodeCore
      indexes={[]}
      selected={selected}
      tableName={data.serviceTable!.tableName}
      style={data.style}
      columns={table?.columns ?? []}
      primaryKeys={[]}
      foreignKeys={[]}
    />
  )
}
