# NoSQL Schema JSON Guide

## Format

- Root: `collections` array.
- Each collection: `name` string, `fields` object.
- Fields map: `fieldName: typeString`.

## Types

- Scalars: `string`, `number`, `boolean`, `date`.
- Arrays: `array<string>`, `array<number>`, `array<boolean>`, `array<date>`.

## Example

```json
{
  "collections": [
    {
      "name": "users",
      "fields": {
        "id": "string",
        "age": "number",
        "isActive": "boolean",
        "createdAt": "date",
        "tags": "array<string>"
      }
    },
    {
      "name": "orders",
      "fields": {
        "id": "string",
        "userId": "string",
        "total": "number",
        "lines": "array<string>"
      }
    }
  ]
}
```

## Usage

- Parse JSON to AST: instantiate `SqlToAstParser` with dialect `nosql` and call `parse(jsonString)`.
- Generate JSON from AST: instantiate `AstToSqlGenerator` with dialect `nosql` and call `generateNoSQL(ast)`.
