import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAutoRef } from '@/hooks/use-auto-ref'
import { cn } from '@/lib/utils'
import { useEffectState } from 'daily-code/react'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type ColumnType = {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey: boolean
  isForeignKey: boolean
}

type TDatabaseColumnInputProps = {
  triggerRemove: () => void
  triggerChanges: (data: Partial<ColumnType>) => void
  column: ColumnType
  autoSave?: boolean
  readOnly?: boolean
}

export function DatabaseColumnInput({
  column,
  triggerRemove,
  triggerChanges,
  autoSave = false,
  readOnly,
}: TDatabaseColumnInputProps) {
  const ref = useAutoRef(column)

  const [inEditMode, setInEditMode] = useState(false)
  const [localColumn, setLocalColumn] = useEffectState(column, [
    column.name,
    column.type,
    column.nullable,
    column.isPrimaryKey,
  ])

  useEffect(() => {
    if (!autoSave || !inEditMode) return
    const currentColumn = ref.current
    if (
      localColumn.name === currentColumn.name &&
      localColumn.type === currentColumn.type &&
      localColumn.nullable === currentColumn.nullable &&
      localColumn.isPrimaryKey === currentColumn.isPrimaryKey
    ) {
      return
    }

    const timeoutId = setTimeout(() => {
      triggerChanges(localColumn)
    }, 350)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [autoSave, inEditMode, ref, localColumn, triggerChanges])

  return (
    <div className="border-stock bg-card space-y-2 rounded border p-2">
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {localColumn.isPrimaryKey && (
            <span
              className="text-xs font-semibold text-amber-600"
              title="Primary Key"
            >
              PK
            </span>
          )}
          {localColumn.isForeignKey && !localColumn.isPrimaryKey && (
            <span
              className="text-xs font-semibold text-blue-600"
              title="Foreign Key"
            >
              FK
            </span>
          )}
          <span className="truncate font-mono text-xs font-medium">
            {localColumn.name}
          </span>
        </div>
        {!readOnly && (
          <Button
            size="sm"
            variant="ghost"
            onClick={triggerRemove}
            className="text-muted-foreground h-5 w-5 p-0 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Column Details (Expandable) */}
      {inEditMode ? (
        <div className="space-y-3 border-t pt-1">
          <div className="space-y-2">
            <Label className="text-xs">Column Name</Label>
            <Input
              className="bg-input !h-11 w-full rounded-[0.8rem] shadow-none"
              value={localColumn.name}
              onChange={(e) =>
                setLocalColumn((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Data Type</Label>
            <Input
              placeholder="VARCHAR(255), INT, etc."
              className="bg-input !h-11 rounded-[0.8rem] font-mono text-xs shadow-none"
              value={localColumn.type}
              onChange={(e) =>
                setLocalColumn((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Nullable</Label>
            <Select
              value={localColumn.nullable ? 'yes' : 'no'}
              onValueChange={(value) =>
                setLocalColumn((prev) => ({
                  ...prev,
                  nullable: value === 'yes',
                }))
              }
            >
              <SelectTrigger className="bg-input !h-11 w-full rounded-[0.8rem] text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes (NULL)</SelectItem>
                <SelectItem value="no">No (NOT NULL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setLocalColumn((prev) => ({
                  ...prev,
                  isPrimaryKey: !prev.isPrimaryKey,
                }))
              }
              className={cn(
                'h-11 w-full flex-1 rounded-[0.8rem] bg-transparent text-xs shadow-none transition-all',
                localColumn.isPrimaryKey &&
                  'bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-destructive/20'
              )}
            >
              {localColumn.isPrimaryKey ? 'Remove PK' : 'Set as PK'}
            </Button>
          </div>

          <Button
            size="sm"
            className="h-11 w-full rounded-[0.8rem] text-xs shadow-none"
            onClick={() => {
              setInEditMode(false)
              triggerChanges(localColumn)
            }}
          >
            Done
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t pt-1 text-xs">
          <span className="text-paragraph font-mono break-all">
            {localColumn.type}
          </span>
          {!readOnly && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 px-2 text-xs text-blue-600"
              onClick={() => setInEditMode(true)}
            >
              Edit
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
