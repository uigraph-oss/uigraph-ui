'use client'

import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

// ─── Schema types ────────────────────────────────────────────

export type SchemaNode = {
  type?: string
  format?: string
  required?: string[]
  example?: unknown
  properties?: Record<string, SchemaNode>
  items?: SchemaNode
  allOf?: SchemaNode[]
  oneOf?: SchemaNode[]
  anyOf?: SchemaNode[]
  $ref?: string
}

type ParsedParameter = {
  Name: string
  In: string
  Description: string
  Required: boolean
  Type: string
}

type StatusCodeMap = Record<string, string>

// ─── Helpers ─────────────────────────────────────────────────

function tryParseJSON<T>(value: string | undefined | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function typeColor(type?: string) {
  switch (type) {
    case 'string':
      return 'text-emerald-400'
    case 'integer':
    case 'number':
      return 'text-sky-400'
    case 'boolean':
      return 'text-amber-400'
    case 'array':
      return 'text-purple-400'
    case 'object':
      return 'text-orange-400'
    default:
      return 'text-muted-foreground'
  }
}

function statusCodeColor(code: string) {
  if (code.startsWith('2'))
    return 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
  if (code.startsWith('3'))
    return 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30'
  if (code.startsWith('4'))
    return 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
  if (code.startsWith('5'))
    return 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
  return 'bg-[#1E2533] text-[#D2D9E6] ring-1 ring-[#2A3242]'
}

// ─── SchemaTree (recursive) ──────────────────────────────────

function SchemaProperty({
  name,
  schema,
  isRequired,
  depth = 0,
  showRequired = true,
}: {
  name: string
  schema: SchemaNode
  isRequired: boolean
  depth?: number
  showRequired?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const hasChildren =
    schema.properties ||
    schema.items ||
    schema.allOf ||
    schema.oneOf ||
    schema.anyOf

  const displayType = schema.type
    ? schema.type + (schema.format ? ` (${schema.format})` : '')
    : schema.$ref
      ? (schema.$ref.split('/').pop() ?? '$ref')
      : 'unknown'

  return (
    <div className={cn('border-l border-[#2A3242]', depth > 0 && 'ml-4')}>
      <div
        className={cn(
          'flex items-center gap-2 py-1 pr-3 pl-2',
          hasChildren && 'cursor-pointer hover:bg-[#1E2533]'
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-[#586378]" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-[#586378]" />
          )
        ) : (
          <span className="w-3" />
        )}

        <span className="text-sm font-medium text-[#F4F7FC]">{name}</span>

        <span className={cn('font-mono text-xs', typeColor(schema.type))}>
          {displayType}
        </span>

        {showRequired && isRequired && (
          <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-400 ring-1 ring-red-500/30">
            required
          </span>
        )}

        {schema.example !== undefined && (
          <span className="text-muted-foreground ml-auto text-xs">
            e.g.{' '}
            <code className="rounded bg-[#1E2533] px-1 py-0.5 text-[10px]">
              {typeof schema.example === 'string'
                ? schema.example
                : JSON.stringify(schema.example)}
            </code>
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="pl-1">
          {/* Object properties */}
          {schema.properties &&
            Object.entries(schema.properties).map(([propName, propSchema]) => (
              <SchemaProperty
                key={propName}
                name={propName}
                schema={propSchema}
                isRequired={schema.required?.includes(propName) ?? false}
                depth={depth + 1}
                showRequired={showRequired}
              />
            ))}

          {/* Array items */}
          {schema.items && (
            <SchemaProperty
              name="[items]"
              schema={schema.items}
              isRequired={false}
              depth={depth + 1}
              showRequired={showRequired}
            />
          )}

          {/* allOf / oneOf / anyOf */}
          {schema.allOf?.map((s, i) => (
            <SchemaProperty
              key={`allOf-${i}`}
              name={`allOf[${i}]`}
              schema={s}
              isRequired={false}
              depth={depth + 1}
              showRequired={showRequired}
            />
          ))}
          {schema.oneOf?.map((s, i) => (
            <SchemaProperty
              key={`oneOf-${i}`}
              name={`oneOf[${i}]`}
              schema={s}
              isRequired={false}
              depth={depth + 1}
              showRequired={showRequired}
            />
          ))}
          {schema.anyOf?.map((s, i) => (
            <SchemaProperty
              key={`anyOf-${i}`}
              name={`anyOf[${i}]`}
              schema={s}
              isRequired={false}
              depth={depth + 1}
              showRequired={showRequired}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function SchemaTree({
  schema,
  showRequired = true,
}: {
  schema: SchemaNode
  showRequired?: boolean
}) {
  if (!schema.properties && !schema.items && !schema.allOf) {
    return (
      <div className="text-muted-foreground py-2 text-xs">
        Type:{' '}
        <span className={typeColor(schema.type)}>
          {schema.type || 'unknown'}
        </span>
        {schema.format && <span> ({schema.format})</span>}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#2A3242] bg-[#141925]">
      {schema.properties &&
        Object.entries(schema.properties).map(([name, propSchema]) => (
          <SchemaProperty
            key={name}
            name={name}
            schema={propSchema}
            isRequired={schema.required?.includes(name) ?? false}
            depth={0}
            showRequired={showRequired}
          />
        ))}
      {schema.items && (
        <SchemaProperty
          name="[items]"
          schema={schema.items}
          isRequired={false}
          depth={0}
          showRequired={showRequired}
        />
      )}
      {schema.allOf?.map((s, i) => (
        <SchemaProperty
          key={`allOf-${i}`}
          name={`allOf[${i}]`}
          schema={s}
          isRequired={false}
          depth={0}
          showRequired={showRequired}
        />
      ))}
    </div>
  )
}

// ─── Parameters Table ────────────────────────────────────────

function ParametersTable({ parameters }: { parameters: ParsedParameter[] }) {
  const grouped = useMemo(() => {
    const groups: Record<string, ParsedParameter[]> = {}
    for (const p of parameters) {
      const loc = p.In || 'other'
      if (!groups[loc]) groups[loc] = []
      groups[loc].push(p)
    }
    return groups
  }, [parameters])

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([location, params]) => (
        <div key={location}>
          <div className="mb-1.5 text-xs font-medium tracking-wider text-[#828DA3] uppercase">
            {location} parameters
          </div>
          <div className="overflow-hidden rounded-lg border border-[#2A3242]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A3242] bg-[#1E2533]/50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#828DA3]">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#828DA3]">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#828DA3]">
                    Required
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#828DA3]">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {params.map((p) => (
                  <tr
                    key={p.Name}
                    className="border-b border-[#2A3242] last:border-0"
                  >
                    <td className="px-3 py-2 font-mono text-xs font-medium text-[#F4F7FC]">
                      {p.Name}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 font-mono text-xs',
                        typeColor(p.Type)
                      )}
                    >
                      {p.Type || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {p.Required ? (
                        <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-400 ring-1 ring-red-500/30">
                          required
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          optional
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-3 py-2 text-xs">
                      {p.Description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Status Codes ────────────────────────────────────────────

function StatusCodesView({ statusCodes }: { statusCodes: StatusCodeMap }) {
  const sorted = useMemo(
    () => Object.entries(statusCodes).sort(([a], [b]) => a.localeCompare(b)),
    [statusCodes]
  )

  return (
    <div className="overflow-hidden rounded-lg border border-[#2A3242]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2A3242] bg-[#1E2533]/50">
            <th className="px-3 py-2 text-left text-xs font-medium text-[#828DA3]">
              Code
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-[#828DA3]">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([code, desc]) => (
            <tr key={code} className="border-b border-[#2A3242] last:border-0">
              <td className="px-3 py-2">
                <span
                  className={cn(
                    'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                    statusCodeColor(code)
                  )}
                >
                  {code}
                </span>
              </td>
              <td className="text-muted-foreground px-3 py-2 text-xs">
                {desc || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────

export type EndpointSchemaData = {
  requestSchema?: string | null
  responseSchema?: string | null
  statusCodes?: string | null
  parameters?: string | null
  tags?: string | null
  deprecated?: string | null
  description?: string | null
}

export function EndpointSchemaView({ data }: { data: EndpointSchemaData }) {
  const requestSchema = tryParseJSON<SchemaNode>(data.requestSchema)
  const responseSchema = tryParseJSON<SchemaNode>(data.responseSchema)
  const statusCodes = tryParseJSON<StatusCodeMap>(data.statusCodes)
  const parameters = tryParseJSON<ParsedParameter[]>(data.parameters)

  const tags = data.tags?.split(', ').filter(Boolean) ?? []
  const isDeprecated = data.deprecated === 'true'

  const hasContent =
    data.description ||
    isDeprecated ||
    tags.length > 0 ||
    parameters ||
    requestSchema ||
    responseSchema ||
    statusCodes

  if (!hasContent) {
    return null
  }

  return (
    <div className="space-y-6 px-6 py-4">
      {/* Deprecation + Tags */}
      {(isDeprecated || tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {isDeprecated && (
            <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
              Deprecated
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#1E2533] px-2 py-1 text-xs font-medium text-[#828DA3]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div>
          <div className="mb-1.5 text-xs font-medium tracking-wider text-[#828DA3] uppercase">
            Description
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#D2D9E6]">
            {data.description}
          </p>
        </div>
      )}

      {/* Parameters */}
      {parameters && parameters.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium tracking-wider text-[#828DA3] uppercase">
            Parameters
          </div>
          <ParametersTable parameters={parameters} />
        </div>
      )}

      {/* Request Schema */}
      {requestSchema && (
        <div>
          <div className="mb-2 text-xs font-medium tracking-wider text-[#828DA3] uppercase">
            Request Body
          </div>
          <SchemaTree schema={requestSchema} />
        </div>
      )}

      {/* Response Schema */}
      {responseSchema && (
        <div>
          <div className="mb-2 text-xs font-medium tracking-wider text-[#828DA3] uppercase">
            Response Body
          </div>
          <SchemaTree schema={responseSchema} showRequired={false} />
        </div>
      )}

      {/* Status Codes */}
      {statusCodes && Object.keys(statusCodes).length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium tracking-wider text-[#828DA3] uppercase">
            Status Codes
          </div>
          <StatusCodesView statusCodes={statusCodes} />
        </div>
      )}
    </div>
  )
}
