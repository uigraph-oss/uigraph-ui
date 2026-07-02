import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { generateUUID } from 'daily-code'
import { Plus, X } from 'lucide-react'
import { z } from 'zod'
import { useEditorContext } from './editor-context'
import { DynamoGsiSchema } from './nosql-schema'

const KEY_TYPE_OPTIONS = [
  { value: 'S', label: 'String' },
  { value: 'N', label: 'Number' },
  { value: 'B', label: 'Binary' },
] as const

export function EditorStepIndexes() {
  const { currentDialect, dynamoSchema, setDynamoSchema } = useEditorContext()

  if (!dynamoSchema) return null

  function addGsi() {
    setDynamoSchema({
      ...dynamoSchema,
      globalSecondaryIndexes: [
        ...dynamoSchema.globalSecondaryIndexes,
        {
          id: generateUUID(),
          name: '',
          partitionKey: '',
          partitionKeyType: 'S',
          sortKey: '',
          sortKeyType: 'S',
        },
      ],
    })
  }

  function updateGsi(
    gsiId: string,
    patch: Partial<z.infer<typeof DynamoGsiSchema>>
  ) {
    setDynamoSchema({
      ...dynamoSchema,
      globalSecondaryIndexes: dynamoSchema.globalSecondaryIndexes.map((gsi) =>
        gsi.id === gsiId ? { ...gsi, ...patch } : gsi
      ),
    })
  }

  function removeGsi(gsiId: string) {
    setDynamoSchema({
      ...dynamoSchema,
      globalSecondaryIndexes: dynamoSchema.globalSecondaryIndexes.filter(
        (gsi) => gsi.id !== gsiId
      ),
    })
  }

  if (currentDialect === 'dynamodb') {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Global Secondary Indexes (GSIs)
          </p>
          <p className="text-muted-foreground text-xs">
            Add secondary indexes to enable efficient queries on different key
            patterns.
          </p>
        </div>

        {dynamoSchema.globalSecondaryIndexes.length === 0 ? (
          <div className="bg-secondary rounded-lg border p-8 text-center">
            <p className="text-muted-foreground text-sm">No GSIs yet</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Add a Global Secondary Index to enable alternative query patterns.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dynamoSchema.globalSecondaryIndexes.map((gsi) => {
              const sortKeyType = gsi.sortKeyType || 'S'
              return (
                <div
                  key={gsi.id}
                  className="bg-secondary space-y-3 rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <label className="text-foreground text-xs font-semibold">
                        Index name
                      </label>
                      <Input
                        className="border-stock text-foreground bg-card h-[3.5rem] w-full rounded-[1rem] border px-4 text-sm"
                        value={gsi.name}
                        onChange={(event) =>
                          updateGsi(gsi.id, { name: event.target.value })
                        }
                        placeholder="GSI name"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeGsi(gsi.id)}
                      className="mt-6 h-[3.5rem] w-[3.5rem] shrink-0 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="bg-card space-y-2 rounded-lg border p-3">
                      <label className="text-foreground text-xs font-semibold">
                        Partition key
                      </label>
                      <div className="flex gap-2">
                        <Input
                          className="border-stock text-foreground bg-card h-[3.5rem] flex-1 rounded-[1rem] border px-4 text-sm"
                          value={gsi.partitionKey}
                          onChange={(event) =>
                            updateGsi(gsi.id, {
                              partitionKey: event.target.value,
                            })
                          }
                          placeholder="gsi_pk"
                        />
                        <ToggleGroup
                          type="single"
                          value={gsi.partitionKeyType || 'S'}
                          onValueChange={(value: 'S' | 'N' | 'B') => {
                            if (value) {
                              updateGsi(gsi.id, {
                                partitionKeyType: value,
                              })
                            }
                          }}
                          className="border-border h-[3.5rem] flex-none overflow-hidden rounded-md border shadow-none"
                          variant="outline"
                        >
                          {KEY_TYPE_OPTIONS.map((option) => {
                            const isSelected =
                              (gsi.partitionKeyType || 'S') === option.value
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
                        Required. Index partition key attribute name and type.
                      </p>
                    </div>

                    <div
                      className={cn(
                        'space-y-2 rounded-lg border p-3 transition-opacity',
                        gsi.sortKey
                          ? 'bg-card opacity-100'
                          : 'bg-card/50 opacity-60'
                      )}
                    >
                      <label className="text-foreground text-xs font-semibold">
                        Sort key (optional)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          className="border-stock text-foreground bg-card h-[3.5rem] flex-1 rounded-[1rem] border px-4 text-sm"
                          value={gsi.sortKey || ''}
                          onChange={(event) =>
                            updateGsi(gsi.id, { sortKey: event.target.value })
                          }
                          placeholder="sk (optional)"
                        />
                        <ToggleGroup
                          type="single"
                          value={sortKeyType}
                          onValueChange={(value: 'S' | 'N' | 'B') => {
                            if (value) {
                              updateGsi(gsi.id, {
                                sortKeyType: value,
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
                          Optional. Index sort key attribute name and type.
                        </p>
                        {gsi.sortKey && (
                          <button
                            type="button"
                            onClick={() =>
                              updateGsi(gsi.id, {
                                sortKey: '',
                                sortKeyType: 'S',
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
            })}
          </div>
        )}

        <div className="flex justify-end">
          <Button preset="primary" className="h-10 px-3!" onClick={addGsi}>
            <Plus className="h-4 w-4" />
            Add GSI
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="text-muted-foreground text-sm">
        Index configuration will be implemented here for {currentDialect}
      </div>
    </div>
  )
}
