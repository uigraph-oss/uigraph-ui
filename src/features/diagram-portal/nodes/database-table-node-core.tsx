import { SuperCircleLoader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DatabaseIcon, KeyIcon } from 'lucide-react'
import { VscCode } from 'react-icons/vsc'
import { NodeContainer } from './components/node-card'
import { DatabaseTableSQLNodeData } from './database-table-node-sql'

interface DatabaseTableNodeShellProps {
  selected: boolean
  tableName: string
  baseColor: string | undefined
  children: React.ReactNode

  hasCodeMode?: boolean
  codeModeEnabled?: boolean
  onCodeModeEnable?: () => void
}

interface DatabaseTableNodeCoreProps {
  selected: boolean
  tableName: string
  style: DatabaseTableSQLNodeData['style']

  columns: {
    name: string
    type: string
    isPrimaryKey: boolean
    isForeignKey: boolean
    nullable: boolean
  }[]

  indexes: {
    name: string
    columns: string[]
    unique: boolean
  }[]

  primaryKeys: string[]

  foreignKeys: {
    columnName: string
    referencedTable: string
    referencedColumn: string
  }[]
}

interface DatabaseTableNodeInvalidProps {
  selected: boolean
  tableName: string
  isLoading: boolean
  style: DatabaseTableSQLNodeData['style']
}

export function DatabaseTableNodeShell({
  selected,
  tableName,
  baseColor,
  children,
  hasCodeMode,
  codeModeEnabled,
  onCodeModeEnable,
}: DatabaseTableNodeShellProps) {
  return (
    <NodeContainer selected={selected}>
      <div
        className={cn(
          'border-stock bg-card relative min-w-[360px] overflow-hidden rounded-lg border-2 shadow-lg transition-[border-color]',
          selected && 'border-primary'
        )}
      >
        <div
          className="bg-primary flex items-center justify-between gap-2 px-4 py-3"
          style={{ backgroundColor: baseColor }}
        >
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5 text-white" />
            <h3 className="truncate text-base font-semibold text-white">
              {tableName}
            </h3>
          </div>

          {hasCodeMode && (
            <Button
              onClick={() => onCodeModeEnable?.()}
              preset={codeModeEnabled ? 'outline' : 'primary'}
              className={cn(
                'size-9 border-none!',
                !codeModeEnabled && 'hover:bg-background/15'
              )}
            >
              <VscCode className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="bg-card">{children}</div>
      </div>
    </NodeContainer>
  )
}

export function DatabaseTableNodeCore({
  selected,
  tableName,
  style,
  indexes,
  foreignKeys,
  primaryKeys,
  columns,
  ...props
}: DatabaseTableNodeCoreProps) {
  return (
    <DatabaseTableNodeShell
      selected={selected}
      tableName={tableName}
      baseColor={style?.baseColor}
      {...props}
    >
      <div className="max-h-[400px] overflow-y-auto">
        {columns.map((column, index) => {
          const isPrimary = primaryKeys.includes(column.name)
          const isForeign = foreignKeys.some(
            (fk) => fk.columnName === column.name
          )

          return (
            <div
              key={column.name}
              className={`border-stock hover:bg-accent border-b px-4 py-2 transition-colors ${
                index === columns.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {isPrimary && (
                    <KeyIcon className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                  )}
                  {isForeign && !isPrimary && (
                    <KeyIcon className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                  )}
                  <span className="text-foreground truncate font-mono text-sm font-medium">
                    {column.name}
                  </span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <span className="text-paragraph font-mono text-xs">
                    {column.type}
                  </span>
                </div>
              </div>

              {isForeign && (
                <div className="mt-1 ml-6">
                  {foreignKeys
                    .filter((fk) => fk.columnName === column.name)
                    .map((fk, fkIndex) => (
                      <div
                        key={fkIndex}
                        className="flex items-center gap-1 text-xs text-blue-400"
                      >
                        <span>→</span>
                        <span className="font-mono">
                          {fk.referencedTable}.{fk.referencedColumn}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {indexes && indexes.length > 0 && (
        <div className="border-stock bg-shading-gray border-t px-4 py-2">
          <div className="text-foreground mb-1 text-xs font-semibold">
            Indexes ({indexes.length})
          </div>
          <div className="space-y-1">
            {indexes.slice(0, 3).map((index, idx) => (
              <div
                key={idx}
                className="text-paragraph flex items-center gap-1 text-xs"
              >
                {index.unique && (
                  <Badge variant="outline" className="h-4 px-1 py-0 text-[9px]">
                    UNIQUE
                  </Badge>
                )}
                <span className="truncate font-mono">{index.name}</span>
              </div>
            ))}
            {indexes.length > 3 && (
              <div className="text-paragraph text-xs">
                +{indexes.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </DatabaseTableNodeShell>
  )
}

export function DatabaseTableNodeInvalid({
  selected,
  tableName,
  isLoading,
  style,
}: DatabaseTableNodeInvalidProps) {
  return (
    <NodeContainer selected={selected}>
      <div
        className={cn(
          'border-stock bg-card relative max-w-[350px] min-w-[280px] overflow-hidden rounded-lg border-2 shadow-lg transition-[border-color]',
          selected && 'border-primary'
        )}
      >
        <div
          className="bg-primary flex items-center gap-2 px-4 py-3"
          style={{ backgroundColor: style?.baseColor }}
        >
          <DatabaseIcon className="h-5 w-5 text-white" />
          <h3 className="truncate text-base font-semibold text-white">
            {tableName}
          </h3>
        </div>

        <div className="flex h-15 items-center justify-center gap-2">
          {isLoading ? (
            <>
              <SuperCircleLoader />
              Loading table...
            </>
          ) : (
            <p className="text-paragraph text-sm">Table not found</p>
          )}
        </div>
      </div>
    </NodeContainer>
  )
}
