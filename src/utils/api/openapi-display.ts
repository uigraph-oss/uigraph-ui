type SchemaObj = Record<string, unknown>

function tryParseJson(raw: string): unknown | null {
  return parseJsonDeep(raw)
}

/** Parse JSON, unwrapping nested JSON string encodings from double-encoded storage. */
export function parseJsonDeep(raw: string, depth = 0): unknown | null {
  if (!raw?.trim() || raw.trim() === 'null' || depth > 5) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed === 'string') {
      return parseJsonDeep(parsed, depth + 1) ?? parsed
    }
    return parsed
  } catch {
    return null
  }
}

function sampleEntryToStorageValue(entry: string): unknown {
  const trimmed = entry.trim()
  if (!trimmed) return null
  const parsed = parseJsonDeep(trimmed)
  return parsed !== null ? parsed : trimmed
}

/** Serialize user samples as a JSON array for storage. */
export function serializeExampleSamples(
  value?: string | string[] | null
): string | undefined {
  if (value == null) return undefined
  const list = Array.isArray(value) ? value : [value]
  const items = list
    .map(sampleEntryToStorageValue)
    .filter((item): item is NonNullable<typeof item> => item != null)
  if (items.length === 0) return undefined
  return JSON.stringify(items)
}

/** Normalize a sample payload to canonical JSON text for storage. */
export function canonicalizeSampleJson(raw: string): string {
  const parsed = parseJsonDeep(raw)
  if (parsed === null) return raw.trim()
  return JSON.stringify(parsed)
}

function isStatusCodeKey(key: string): boolean {
  return /^\d{3}$/.test(key) || key === 'default'
}

/** Pretty-print JSON and unescape \\n/\\t for GraphQL queries, proto snippets, etc. */
export function prettyPrintJson(raw: string): string {
  if (!raw.trim()) return raw
  const parsed = parseJsonDeep(raw)
  if (parsed === null) {
    return raw.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
  }
  return JSON.stringify(parsed, null, 2)
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
}

/** Generate an example payload from a JSON Schema (refs already resolved by backend). */
export function schemaToExample(
  schema: SchemaObj | null | undefined,
  depth = 0
): unknown {
  if (!schema || depth > 6) return null

  if (schema.example !== undefined) return schema.example

  if (schema.enum) {
    const vals = schema.enum as unknown[]
    return vals[0] ?? null
  }

  for (const combiner of ['allOf', 'anyOf', 'oneOf'] as const) {
    const list = schema[combiner] as SchemaObj[] | undefined
    if (Array.isArray(list) && list.length > 0) {
      if (combiner === 'allOf') {
        const merged: SchemaObj = {}
        for (const sub of list) Object.assign(merged, sub)
        return schemaToExample(merged, depth + 1)
      }
      return schemaToExample(list[0], depth + 1)
    }
  }

  const type = schema.type as string | undefined

  if (type === 'object' || schema.properties) {
    const props = (schema.properties ?? {}) as Record<string, SchemaObj>
    const result: Record<string, unknown> = {}
    for (const [key, propSchema] of Object.entries(props)) {
      result[key] = schemaToExample(propSchema, depth + 1)
    }
    return result
  }

  if (type === 'array' || schema.items) {
    const items = (schema.items ?? {}) as SchemaObj
    return [schemaToExample(items, depth + 1)]
  }

  const format = schema.format as string | undefined
  switch (type) {
    case 'string':
      if (format === 'email') return 'user@example.com'
      if (format === 'date-time') return '2024-01-01T00:00:00Z'
      if (format === 'date') return '2024-01-01'
      if (format === 'password') return '********'
      if (format === 'uuid') return '00000000-0000-0000-0000-000000000000'
      if (format === 'uri') return 'https://example.com'
      return 'string'
    case 'integer':
      return 0
    case 'number':
      return 0
    case 'boolean':
      return true
    default:
      return null
  }
}

function exampleFromNormalizedResponse(raw: string): string | null {
  const parsed = tryParseJson(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

  const entries = Object.entries(parsed as Record<string, unknown>)
  if (!entries.length || !entries.every(([k]) => isStatusCodeKey(k))) return null

  const payload: Record<string, unknown> = {}
  for (const [status, entry] of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const e = entry as Record<string, unknown>
    let value: unknown = e.example
    if (value == null && e.schema && typeof e.schema === 'object') {
      value = schemaToExample(e.schema as SchemaObj)
    }
    if (value != null) payload[status] = value
  }

  if (Object.keys(payload).length === 0) return null
  if (Object.keys(payload).length === 1) {
    return JSON.stringify(Object.values(payload)[0], null, 2)
  }
  return JSON.stringify(payload, null, 2)
}

/**
 * Format a stored sample for display.
 * REST requestBody = plain JSON Schema → generate example payload.
 * REST responses = { "200": { description, schema, example? } } → example payload(s).
 * GraphQL/gRPC = pretty-print JSON.
 */
export function formatSampleForDisplay(
  raw: string,
  protocol: string,
  kind?: 'request' | 'response'
): string {
  if (!raw.trim() || raw.trim() === 'null') return raw

  if (protocol.toLowerCase() !== 'rest') {
    return prettyPrintJson(raw)
  }

  const parsed = tryParseJson(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return prettyPrintJson(raw)
  }

  if (kind === 'request') {
    const example = schemaToExample(parsed as SchemaObj)
    if (example !== null) return JSON.stringify(example, null, 2)
  }

  if (kind === 'response') {
    const fromResponses = exampleFromNormalizedResponse(raw)
    if (fromResponses) return fromResponses
  }

  return prettyPrintJson(raw)
}

/** Format Request Schema / Response Schema meta fields (REST → example payload). */
export function formatMetaSchemaForDisplay(
  label: string,
  raw: string,
  protocol: string
): string {
  const normalized = label.toLowerCase().trim()
  if (protocol.toLowerCase() === 'rest') {
    if (normalized === 'request schema') {
      return formatSampleForDisplay(raw, protocol, 'request')
    }
    if (normalized === 'response schema') {
      return formatSampleForDisplay(raw, protocol, 'response')
    }
  }
  return prettyPrintJson(raw)
}
