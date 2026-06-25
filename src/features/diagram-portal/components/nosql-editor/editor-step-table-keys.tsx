import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateUUID } from 'daily-code'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { useEditorContext } from './editor-context'
import { DynamoGsiSchema } from './nosql-schema'

export function EditorStepTableKeys() {
  const { coreSchema, dynamoSchema, setDynamoSchema } = useEditorContext()

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

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap gap-3">
        <div className="min-w-[220px] flex-1 space-y-2">
          <label className="text-foreground text-xs font-semibold">
            Table name
          </label>
          <Input
            className="border-stock text-foreground bg-card h-[3.5rem] w-full rounded-[1rem] border px-4 text-sm"
            value={coreSchema.name}
            disabled
          />
        </div>
        <div className="min-w-[220px] flex-1 space-y-2">
          <label className="text-foreground text-xs font-semibold">
            Partition key
          </label>
          <Input
            className="border-stock text-foreground bg-card h-[3.5rem] w-full rounded-[1rem] border px-4 text-sm"
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
        </div>
        <div className="min-w-[220px] flex-1 space-y-2">
          <label className="text-foreground text-xs font-semibold">
            Sort key
          </label>
          <Input
            className="border-stock text-foreground bg-card h-[3.5rem] w-full rounded-[1rem] border px-4 text-sm"
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
        </div>
      </div>
      <div className="bg-secondary space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            Global Secondary Indexes (GSIs)
          </p>
          <Button preset="primary" className="h-10 px-3!" onClick={addGsi}>
            <Plus className="h-4 w-4" />
            Add GSI
          </Button>
        </div>
        {dynamoSchema.globalSecondaryIndexes.length === 0 && (
          <div className="text-paragraph text-xs">No GSIs yet</div>
        )}
        {dynamoSchema.globalSecondaryIndexes.map((gsi) => (
          <div
            key={gsi.id}
            className="bg-card flex flex-wrap items-start gap-2 rounded border p-2"
          >
            <Input
              className="border-stock text-foreground bg-card h-[3.5rem] min-w-[160px] flex-1 rounded-[1rem] border px-4 text-sm"
              value={gsi.name}
              onChange={(event) =>
                updateGsi(gsi.id, { name: event.target.value })
              }
              placeholder="GSI name"
            />
            <Input
              className="border-stock text-foreground bg-card h-[3.5rem] min-w-[160px] flex-1 rounded-[1rem] border px-4 text-sm"
              value={gsi.partitionKey}
              onChange={(event) =>
                updateGsi(gsi.id, {
                  partitionKey: event.target.value,
                })
              }
              placeholder="Partition key"
            />
            <Input
              className="border-stock text-foreground bg-card h-[3.5rem] min-w-[160px] flex-1 rounded-[1rem] border px-4 text-sm"
              value={gsi.sortKey || ''}
              onChange={(event) =>
                updateGsi(gsi.id, { sortKey: event.target.value })
              }
              placeholder="Sort key (optional)"
            />
            <div className="flex w-full justify-end">
              <Button
                size="sm"
                preset="outline"
                onClick={() => removeGsi(gsi.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
