import { BsCollection } from 'react-icons/bs'
import { ServiceDbSchema } from '../../api/service-db'
import { RenderDynamoTable } from './components/render-dynamo-table'
import { DynamoSchemaView } from './dynamo-schema-view'
import {
  JsonCollectionsSchemaView,
  JsonTablesSchemaView,
  MongoSchemaView,
} from './nosql-collections-schema-view'
import { SchemaEmptyState, SchemaViewShell } from './schema-view-shared'
import { getSchemaViewKind } from './schema-view-utils'
import { SqlSchemaView } from './sql-schema-view'

export function getSchemaSectionTitle(
  kind: ReturnType<typeof getSchemaViewKind>
) {
  switch (kind) {
    case 'dynamodb':
      return 'Table schema'
    case 'mongodb':
    case 'json-collections':
    case 'json-tables':
      return 'Collections'
    case 'sql':
      return 'Tables'
    default:
      return 'Schema'
  }
}

export function DatabaseSchemaView({ db }: { db: ServiceDbSchema }) {
  const kind = getSchemaViewKind(db)

  switch (kind) {
    case 'sql':
      return <SqlSchemaView db={db} />
    case 'dynamodb':
      return <DynamoSchemaView db={db} />
    case 'mongodb':
      return <MongoSchemaView db={db} />
    case 'json-collections':
      return <JsonCollectionsSchemaView db={db} />
    case 'json-tables':
      return <JsonTablesSchemaView db={db} />
    case 'empty':
    default:
      return (
        <SchemaViewShell
          db={db}
          kind="empty"
          sectionTitle="Schema"
          sectionIcon={<BsCollection className="size-4" />}
        >
          <SchemaEmptyState kind="empty" />
        </SchemaViewShell>
      )
  }
}

export function DatabaseSchemaContent({ db }: { db: ServiceDbSchema }) {
  const kind = getSchemaViewKind(db)

  switch (kind) {
    case 'sql':
      return <SqlSchemaView db={db} contentOnly />
    case 'dynamodb': {
      const table = db.noSQLSchema?.dynamo?.table
      return table ? (
        <RenderDynamoTable tables={table} />
      ) : (
        <SchemaEmptyState kind="dynamodb" />
      )
    }
    case 'mongodb':
      return <MongoSchemaView db={db} contentOnly />
    case 'json-collections':
      return <JsonCollectionsSchemaView db={db} contentOnly />
    case 'json-tables':
      return <JsonTablesSchemaView db={db} contentOnly />
    case 'empty':
    default:
      return <SchemaEmptyState kind="empty" />
  }
}
