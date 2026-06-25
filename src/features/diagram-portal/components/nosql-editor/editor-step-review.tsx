import { useEditorContext } from './editor-context'

export function EditorStepReview() {
  const { coreSchema, currentDialect, mongoSchema } = useEditorContext()

  if (currentDialect === 'mongodb') {
    if (!mongoSchema) return null

    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Review schema</p>
          <p className="text-muted-foreground text-xs">
            Review your MongoDB database, collections, and indexes before
            saving.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary rounded-lg border p-4">
            <p className="text-foreground mb-1 text-xs font-semibold">
              Database
            </p>
            <p className="text-sm font-medium">
              {coreSchema.name || 'Unnamed'}
            </p>
            {coreSchema.description && (
              <p className="text-muted-foreground mt-1 text-xs">
                {coreSchema.description}
              </p>
            )}
          </div>

          {mongoSchema.collections.length === 0 ? (
            <div className="bg-secondary rounded-lg border p-4 text-center">
              <p className="text-muted-foreground text-sm">
                No collections defined
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mongoSchema.collections.map((collection) => {
                const fieldsCount = collection.fields.length
                const indexesCount = collection.indexes.length
                const fieldNames = collection.fields
                  .filter((f) => f.name.trim() !== '')
                  .map((f) => f.name)
                  .slice(0, 5)
                const indexNames = collection.indexes
                  .filter((i) => i.name.trim() !== '')
                  .map((i) => i.name)
                  .slice(0, 5)

                return (
                  <div
                    key={collection.id}
                    className="bg-secondary rounded-lg border p-4"
                  >
                    <p className="text-foreground mb-1 text-xs font-semibold">
                      Collection &quot;{collection.name}&quot;
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {fieldsCount} field{fieldsCount !== 1 ? 's' : ''} ·{' '}
                      {indexesCount} index{indexesCount !== 1 ? 'es' : ''}
                    </p>
                    {fieldNames.length > 0 && (
                      <div className="mt-2">
                        <p className="text-muted-foreground mb-1 text-xs">
                          Fields:
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {fieldNames.join(', ')}
                          {collection.fields.length > 5 && '...'}
                        </p>
                      </div>
                    )}
                    {indexNames.length > 0 && (
                      <div className="mt-2">
                        <p className="text-muted-foreground mb-1 text-xs">
                          Indexes:
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {indexNames.join(', ')}
                          {collection.indexes.length > 5 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="text-muted-foreground text-sm">
        Review step will be implemented here for {currentDialect}
      </div>
    </div>
  )
}
