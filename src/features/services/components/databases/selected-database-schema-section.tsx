import { ServiceDbSchema } from '../../api/service-db'
import { DatabaseSchemaView } from './database-schema-view'

export function SelectedDatabaseSchemaSection({ db }: { db: ServiceDbSchema }) {
  return <DatabaseSchemaView db={db} />
}
