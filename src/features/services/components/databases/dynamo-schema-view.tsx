import { CiViewTable } from 'react-icons/ci'
import { ServiceDbSchema } from '../../api/service-db'
import { RenderDynamoTable } from './components/render-dynamo-table'
import { SchemaEmptyState, SchemaViewShell } from './schema-view-shared'

export function DynamoSchemaView({ db }: { db: ServiceDbSchema }) {
  const table = db.noSQLSchema?.dynamo?.table

  return (
    <SchemaViewShell
      db={db}
      kind="dynamodb"
      sectionTitle="Table schema"
      sectionIcon={<CiViewTable className="size-5" />}
    >
      {table ? (
        <RenderDynamoTable tables={table} />
      ) : (
        <SchemaEmptyState kind="dynamodb" />
      )}
    </SchemaViewShell>
  )
}
