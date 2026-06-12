import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useEditorContext } from './editor-context'

export function EditorStepBasic() {
  const { currentDialect, coreSchema, setCoreSchema } = useEditorContext()

  const nameLabel =
    currentDialect === 'dynamodb'
      ? 'Table name'
      : currentDialect === 'mongodb'
        ? 'Database name'
        : 'Database name'

  const helperText =
    currentDialect === 'mongodb'
      ? 'Used as the MongoDB database name.'
      : undefined

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap gap-3">
        <div className="min-w-[240px] flex-1 space-y-2">
          <label className="text-xs font-semibold text-gray-700">
            {nameLabel}
          </label>
          <Input
            className="border-stock text-foreground h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm"
            value={coreSchema.name}
            onChange={(event) => setCoreSchema({ name: event.target.value })}
            placeholder={
              currentDialect === 'dynamodb'
                ? 'my-table'
                : currentDialect === 'mongodb'
                  ? 'my-database'
                  : 'BillingDB'
            }
          />
          {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>
        <div className="w-full space-y-2">
          <label className="text-xs font-semibold text-gray-700">
            Description
          </label>
          <Textarea
            className="border-stock text-foreground w-full rounded-[1rem] border bg-white p-4 text-sm"
            value={coreSchema.description}
            onChange={(event) =>
              setCoreSchema({ description: event.target.value })
            }
            placeholder="Describe the database purpose"
          />
        </div>
      </div>
    </div>
  )
}
