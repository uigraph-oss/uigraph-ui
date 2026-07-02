import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useEditorContext } from './editor-context'

const KEY_TYPE_OPTIONS = [
  { value: 'S', label: 'String' },
  { value: 'N', label: 'Number' },
  { value: 'B', label: 'Binary' },
] as const

export function EditorStepPrimaryKeys() {
  const { coreSchema, dynamoSchema, setDynamoSchema } = useEditorContext()

  if (!dynamoSchema) return null

  const partitionKeyType = dynamoSchema.primaryKey.partitionKeyType
  const sortKeyType = dynamoSchema.primaryKey.sortKeyType

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <label className="text-foreground text-xs font-semibold">
          Table name
        </label>
        <Input
          className="border-stock text-foreground bg-card h-[3.5rem] w-full rounded-[1rem] border px-4 text-sm"
          value={coreSchema.name}
          disabled
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="bg-secondary space-y-2 rounded-lg border p-3">
          <label className="text-foreground text-xs font-semibold">
            Partition key
          </label>
          <div className="flex gap-2">
            <Input
              className="border-stock text-foreground bg-card h-[3.5rem] flex-1 rounded-[1rem] border px-4 text-sm"
              value={dynamoSchema.primaryKey.partitionKey}
              onChange={(event) =>
                setDynamoSchema({
                  ...dynamoSchema,
                  primaryKey: {
                    ...dynamoSchema.primaryKey,
                    partitionKey: event.target.value,
                  },
                })
              }
              placeholder="pk"
            />
            <ToggleGroup
              type="single"
              value={partitionKeyType}
              onValueChange={(value: 'S' | 'N' | 'B') => {
                if (value) {
                  setDynamoSchema({
                    ...dynamoSchema,
                    primaryKey: {
                      ...dynamoSchema.primaryKey,
                      partitionKeyType: value,
                    },
                  })
                }
              }}
              className="border-border h-[3.5rem] flex-none overflow-hidden rounded-md border shadow-none"
              variant="outline"
            >
              {KEY_TYPE_OPTIONS.map((option) => {
                const isSelected = partitionKeyType === option.value
                return (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                      'h-full w-[66px] px-3 text-xs font-medium transition-all',
                      '!border-0 !shadow-none first:!rounded-l-md last:!rounded-r-md',
                      isSelected
                        ? 'bg-primary hover:bg-primary/90 focus-visible:ring-primary z-10 font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-1'
                        : 'bg-card text-foreground hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1'
                    )}
                  >
                    {option.label}
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </div>
          <p className="text-muted-foreground text-xs">
            Required. Primary partition key attribute name and type.
          </p>
        </div>

        <div
          className={cn(
            'space-y-2 rounded-lg border p-3 transition-opacity',
            dynamoSchema.primaryKey.sortKey
              ? 'bg-secondary opacity-100'
              : 'bg-secondary/50 opacity-60'
          )}
        >
          <label className="text-foreground text-xs font-semibold">
            Sort key
          </label>
          <div className="flex gap-2">
            <Input
              className="border-stock text-foreground bg-card h-[3.5rem] flex-1 rounded-[1rem] border px-4 text-sm"
              value={dynamoSchema.primaryKey.sortKey}
              onChange={(event) =>
                setDynamoSchema({
                  ...dynamoSchema,
                  primaryKey: {
                    ...dynamoSchema.primaryKey,
                    sortKey: event.target.value,
                  },
                })
              }
              placeholder="sk (optional)"
            />
            <ToggleGroup
              type="single"
              value={sortKeyType}
              onValueChange={(value: 'S' | 'N' | 'B') => {
                if (value) {
                  setDynamoSchema({
                    ...dynamoSchema,
                    primaryKey: {
                      ...dynamoSchema.primaryKey,
                      sortKeyType: value,
                    },
                  })
                }
              }}
              className="border-border h-[3.5rem] flex-none overflow-hidden rounded-md border shadow-none"
              variant="outline"
            >
              {KEY_TYPE_OPTIONS.map((option) => {
                const isSelected = sortKeyType === option.value
                return (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                      'h-full w-[66px] px-3 text-xs font-medium transition-all',
                      '!border-0 !shadow-none first:!rounded-l-md last:!rounded-r-md',
                      isSelected
                        ? 'bg-primary hover:bg-primary/90 focus-visible:ring-primary z-10 font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-1'
                        : 'bg-card text-foreground hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1'
                    )}
                  >
                    {option.label}
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs">
              Optional. Primary sort key attribute name and type.
            </p>
            {dynamoSchema.primaryKey.sortKey && (
              <button
                type="button"
                onClick={() =>
                  setDynamoSchema({
                    ...dynamoSchema,
                    primaryKey: {
                      ...dynamoSchema.primaryKey,
                      sortKey: '',
                    },
                  })
                }
                className="text-primary hover:text-primary/80 text-xs underline"
              >
                No sort key
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
