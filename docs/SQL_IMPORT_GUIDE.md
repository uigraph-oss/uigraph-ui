# SQL Import Feature - User Guide

## Overview

The SQL Import feature allows you to upload SQL dump files (MySQL, PostgreSQL, SQLite) and automatically import all database tables into your flow diagram with full relationship visualization.

## Key Features

✨ **AST-Based Parsing**: Uses Abstract Syntax Tree for robust, bidirectional SQL conversion  
🔄 **Bidirectional Editing**: Edit tables in UI, automatically sync with SQL  
🗄️ **Multi-Dialect**: Supports MySQL, PostgreSQL, and SQLite with auto-detection  
📝 **Visual Editing**: Edit table structures using the properties panel  
🔗 **Auto-Relationships**: Foreign keys are automatically drawn as connecting arrows  
💾 **Regenerate SQL**: Convert modified tables back to SQL at any time

## How to Use

### 1. **Upload SQL File**

1. Open your flow diagram
2. Click the **SQL Import** button (database import icon) in the left sidebar
3. Click **"Upload SQL File"**
4. Select a `.sql` file from your computer

The system will:

- Automatically detect the SQL dialect (MySQL/PostgreSQL/SQLite)
- Parse all CREATE TABLE statements
- Display a summary with table count and relationships

### 2. **Review Imported Schema**

- Click on a source to expand it
- View all tables in the schema
- See column counts for each table
- Review relationship statistics

### 3. **Import to Canvas**

Click **"Import to Canvas"** to add all tables to your flow diagram.

Tables will be:

- Automatically arranged in a grid layout
- Connected with arrows showing foreign key relationships
- Fully interactive and editable

### 4. **Edit Tables in UI**

**Select any database table** in the canvas to open the properties panel:

#### Add Columns:

- Click "Add" in the Columns section
- Columns are created with default values

#### Edit Column Properties:

- Click "Edit" on any column
- Change name, data type, nullable status
- Set or remove primary keys

#### Remove Columns:

- Click the trash icon next to any column
- The last column cannot be removed

#### View Relationships:

- Primary Keys section shows all PK columns
- Foreign Keys section shows all FK relationships

### 5. **Edit SQL Directly**

Click the **Edit icon** (pencil) on any source to:

- View the generated SQL
- Make changes directly in the SQL editor
- Click the check mark to save changes
- Cancel to discard changes

### 6. **Regenerate SQL**

Click the **Regenerate icon** (refresh) to:

- Convert the current AST back to SQL
- Includes all UI modifications
- Preserves the original dialect
- Updates the stored SQL content

## Supported SQL Features

### Table Structures

- ✅ Tables with columns
- ✅ Primary keys (single and composite)
- ✅ Foreign keys with ON DELETE/UPDATE
- ✅ Unique constraints
- ✅ Check constraints
- ✅ Indexes (single and composite)
- ✅ Default values
- ✅ Auto-increment / Serial

### Data Types

- ✅ All standard SQL types (INT, VARCHAR, TEXT, etc.)
- ✅ Type parameters (VARCHAR(255), DECIMAL(10,2), etc.)
- ✅ MySQL UNSIGNED
- ✅ PostgreSQL WITH TIME ZONE
- ✅ Custom types

### Dialect-Specific

- ✅ MySQL: ENGINE, CHARSET, COLLATE, AUTO_INCREMENT
- ✅ PostgreSQL: SERIAL, BIGSERIAL, TABLESPACE
- ✅ SQLite: Basic syntax

## Example SQL Files

### MySQL Example

```sql
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB CHARACTER SET utf8mb4;

CREATE TABLE posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;
```

### PostgreSQL Example

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_email UNIQUE (email)
);

CREATE INDEX idx_username ON users (username);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON posts (user_id);
```

## Workflow Example

### Complete Editing Workflow

1. **Upload SQL File**
   - Upload `database.sql` (e.g., 7 tables, 12 relationships)
   - System detects: MySQL dialect

2. **Import to Canvas**
   - All 7 tables appear with relationships
   - Foreign keys shown as blue arrows with labels

3. **Edit in UI**
   - Select "users" table
   - Add column: `email_verified BOOLEAN DEFAULT false`
   - Set `user_id` as primary key

4. **View SQL**
   - Click Edit icon
   - See updated CREATE TABLE statement with new column

5. **Save Changes**
   - Click check mark to confirm
   - Or regenerate SQL from AST

6. **Export**
   - Copy generated SQL for use in migrations
   - Or continue editing visually

## Tips & Tricks

### 🎯 Best Practices

1. **Large Schemas**: Upload in parts if you have 50+ tables
2. **Version Control**: Keep original SQL files in version control
3. **Test First**: Try with a small test schema first
4. **Backup**: Export SQL before major edits

### 🔥 Power Features

- **Multi-Source**: Import multiple SQL files for comparison
- **Visual Diff**: Compare different versions visually
- **Quick Edit**: Double-click table to open properties
- **Zoom**: Use minimap for large schemas

### 🐛 Troubleshooting

**"No tables found"**

- Check SQL syntax
- Ensure CREATE TABLE statements exist
- Look for parsing errors in console

**"Failed to parse"**

- SQL dialect might not be fully supported
- Complex syntax may need manual editing
- Try simplifying SQL first

**Missing relationships**

- Ensure FOREIGN KEY constraints are explicit
- Check for typos in table/column names
- Verify referenced tables exist

## Architecture (For Developers)

```
SQL File → Parser → AST → Converter → UI Nodes/Edges
                    ↓
                UI Edits → AST Updates → SQL Generator → New SQL
```

### Key Components:

1. **SqlAstParser**: Parses SQL to AST
2. **AstToUiConverter**: Converts AST to ReactFlow nodes
3. **UiToAstConverter**: Applies UI changes to AST
4. **AstToSqlGenerator**: Generates SQL from AST

See `src/features/services/utils/sql-parser/README.md` for technical details.

## Future Enhancements

- [ ] ALTER TABLE support
- [ ] Views and materialized views
- [ ] Stored procedures visualization
- [ ] Schema diff tool
- [ ] SQL optimization suggestions
- [ ] AI-powered schema generation

## Support

For issues or feature requests, please check:

- Parser implementation: `src/features/services/utils/sql-parser/`
- UI components: `src/features/flow-diagram/left-sidebar/panel-sql-import.tsx`
- Properties panel: `src/features/flow-diagram/properties/node-database-table-properties.tsx`
