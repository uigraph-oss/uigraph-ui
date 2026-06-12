# Database Schema Diagram Feature

This feature allows users to upload SQL or JSON database schema files and visualize them as interactive node diagrams using the UiGraph flow engine.

## Features

### 1. **Schema Upload**
- Support for `.sql` and `.json` files
- Automatic parsing and validation
- Drag-and-drop interface
- Real-time schema preview

### 2. **Schema Storage**
- Schemas are stored as Components with type `database_schema`
- Integrated with the existing component system
- Persistent storage in the database
- Associated with services for organization

### 3. **Interactive Visualization**
- Database tables rendered as interactive nodes
- Foreign key relationships shown as edges
- Auto-layout with force-directed algorithm
- Zoom, pan, and fit-to-view controls
- Export to PNG functionality

### 4. **Database Table Nodes**
- Display all columns with types
- Highlight primary keys (🔑)
- Show foreign key relationships
- Display indexes
- Nullable indicators

## Usage

### Upload a Schema

```tsx
import { DatabaseSchemaUpload } from '@/features/services'

<DatabaseSchemaUpload
  open={isOpen}
  onOpenChange={setIsOpen}
  onSchemaUploaded={(schema, name, content, componentId) => {
    // Handle uploaded schema
  }}
  serviceId="service-123" // Optional: associate with a service
/>
```

### View a Diagram

```tsx
import { DatabaseDiagramViewer } from '@/features/services'

<DatabaseDiagramViewer
  open={isOpen}
  onOpenChange={setIsOpen}
  schema={parsedSchema}
  schemaName="users_database"
/>
```

### Parse a Schema

```tsx
import { parseSQLSchema, parseJSONSchema, validateSchema } from '@/features/services/utils'

// Parse SQL
const schema = parseSQLSchema(sqlContent)

// Parse JSON
const schema = parseJSONSchema(jsonContent)

// Validate
const { valid, errors } = validateSchema(schema)
```

## File Formats

### SQL Format
Supports standard SQL `CREATE TABLE` statements with:
- Column definitions with types and constraints
- Primary keys (inline and separate)
- Foreign keys
- Indexes (unique and non-unique)
- Single-line (`--`) and multi-line (`/* */`) comments

Example:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### JSON Format
Supports multiple JSON schema formats:

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "type": "INTEGER",
          "nullable": false
        }
      ],
      "primaryKey": "id",
      "foreignKeys": [
        {
          "column": "role_id",
          "references": "roles",
          "referencedColumn": "id"
        }
      ]
    }
  ]
}
```

## Components

### Parser (`database-schema-parser.ts`)
- Parses SQL and JSON files
- Extracts tables, columns, keys, and relationships
- Validates schema structure

### Converter (`schema-to-flow-diagram.ts`)
- Converts parsed schema to ReactFlow nodes and edges
- Implements auto-layout algorithm
- Calculates optimal node positions

### Storage (`database-schema-storage.ts`)
- Saves schemas as components
- Loads schemas from components
- Integrates with GraphQL API

### Node Component (`database-table-node.tsx`)
- Custom ReactFlow node for database tables
- Displays columns, keys, and indexes
- Interactive and resizable

### Upload Modal (`database-schema-upload.tsx`)
- File upload interface
- Real-time parsing and validation
- Schema metadata input

### Diagram Viewer (`database-diagram-viewer.tsx`)
- Full-screen interactive diagram
- Zoom, pan, and export controls
- MiniMap for navigation

## Integration

The database schema feature is integrated into the Services section under the "Data / Schema" tab. Users can:

1. Upload schemas via the "Upload Schema" button
2. View uploaded schemas in a grid
3. Click "View Diagram" to see the interactive visualization
4. Schemas are automatically saved as components
5. Associated with the current service (if viewing from a service page)

## Architecture

```
services/
├── components/
│   ├── database-schema-upload.tsx      # Upload modal
│   ├── database-diagram-viewer.tsx     # Diagram viewer
│   └── service-data-schemas.tsx        # Main integration
├── utils/
│   ├── database-schema-parser.ts       # SQL/JSON parser
│   ├── schema-to-flow-diagram.ts       # Converter
│   └── database-schema-storage.ts      # Storage utilities
├── api/
│   └── database-schema-api.ts          # GraphQL mutations
└── flow-diagram/nodes/
    └── database-table-node.tsx         # Custom node type
```

## Future Enhancements

- [ ] Edit schemas directly in the UI
- [ ] Import from live database connections
- [ ] Add support for more database types (PostgreSQL, MongoDB, etc.)
- [ ] Column-level relationship visualization
- [ ] Schema versioning and history
- [ ] Collaborative editing
- [ ] AI-powered schema suggestions
- [ ] Export to different formats (dbdiagram.io, dbml, etc.)

