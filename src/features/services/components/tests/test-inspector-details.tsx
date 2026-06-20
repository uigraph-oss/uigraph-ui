'use client'

import { V2 } from '@/api'
import type { TestCase } from '@/api/.gql/graphql'
import { clientV2 } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { CodeMirrorWrapped, RichTextEditor } from '@/features/component-meta'
import { API_ENDPOINTS } from '@/features/services/api/api-endpoints'
import { endpointsToLegacyWithMeta } from '@/features/services/api/api-v2-adapters'
import {
  deriveRestEndpointOptions,
  parseApiSpecValue,
} from '@/features/services/components/tests/modals/configure-test-case-modal/api-selection-utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { Delta } from 'quill'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

function toDelta(v: string | null | undefined): Delta | string {
  if (!v) return ''
  try {
    const ops = JSON.parse(v)
    return Array.isArray(ops) ? new Delta(ops) : v
  } catch {
    return v
  }
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function formatDate(value: string | null | undefined) {
  if (!value) return null

  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function prettyValue(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-muted-foreground mb-2 text-xs">{children}</div>
}

function InfoTile({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string | number
  mono?: boolean
}) {
  return (
    <div className="border-border rounded-xl border bg-white px-4 py-3">
      <div className="text-muted-foreground mb-1.5 text-xs">{label}</div>
      <div
        className={
          mono
            ? 'text-foreground font-mono text-sm leading-[1.33]'
            : 'text-foreground text-sm leading-[1.33]'
        }
      >
        {value}
      </div>
    </div>
  )
}

function CodeBlock({
  value,
  languageLabel = 'JSON',
  rows = 5,
}: {
  value: string
  languageLabel?: string
  rows?: number
}) {
  if (!hasText(value)) return null

  return (
    <div className="border-border overflow-hidden rounded-xl border bg-white">
      <div className="border-border bg-muted/40 border-b px-3 py-2">
        <span className="text-muted-foreground text-xs">{languageLabel}</span>
      </div>
      <CodeMirrorWrapped
        value={prettyValue(value)}
        setValue={() => {}}
        readonly
        height={`${rows * 1.6}rem`}
      />
    </div>
  )
}

function AssertionList({
  assertions,
}: {
  assertions: Array<{
    field?: string | null
    type?: string | null
    value?: string | null
  }>
}) {
  const rows = assertions.filter(
    (item) =>
      item && (hasText(item.field) || hasText(item.type) || hasText(item.value))
  )

  if (!rows.length) return null

  return (
    <div className="flex flex-col gap-1">
      {rows.map((a, i) => (
        <div
          key={i}
          className="border-border bg-muted/20 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm"
        >
          {hasText(a.field) && (
            <span className="text-foreground font-mono text-sm leading-[1.33]">
              {a.field}
            </span>
          )}
          {hasText(a.type) && (
            <span className="text-muted-foreground text-sm leading-[1.33]">
              {a.type}
            </span>
          )}
          {hasText(a.value) && (
            <span className="text-foreground font-mono text-sm leading-[1.33]">
              &quot;{a.value}&quot;
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function KeyValueList({
  items,
}: {
  items: Array<{ key?: string | null; value?: string | null }>
}) {
  const rows = items.filter((item) => hasText(item.key) || hasText(item.value))

  if (!rows.length) return null

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {rows.map((item, index) => (
        <div
          key={`${item.key ?? 'item'}-${index}`}
          className="border-border grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b px-3 py-2.5 text-sm last:border-b-0"
        >
          <span className="text-foreground font-mono text-sm leading-[1.33] break-all">
            {item.key || '-'}
          </span>
          <span className="text-muted-foreground text-sm leading-[1.33] break-all">
            {item.value || '-'}
          </span>
        </div>
      ))}
    </div>
  )
}

function Overview({
  testCase,
  testPack,
}: {
  testCase: TestCase
  testPack: V2.TestPack | null
}) {
  const reservedTags = new Set([
    (testCase.type ?? '').toLowerCase(),
    'critical',
    'evidence required',
    'requires evidence',
  ])
  const tags = (testCase.labels ?? []).filter(
    (label): label is string =>
      hasText(label) && !reservedTags.has(label.trim().toLowerCase())
  )
  const createdAt = formatDate(testCase.createdAt)
  const updatedAt = formatDate(testCase.updatedAt)

  return (
    <div className="mb-6">
      <SectionLabel>Overview</SectionLabel>
      {hasText(testCase.description) && (
        <div className="border-border text-muted-foreground mb-5 rounded-xl border bg-white px-4 py-3 text-sm leading-[1.33]">
          {testCase.description}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        {testPack?.name && <InfoTile label="Test Pack" value={testPack.name} />}
        {hasText(testCase.testOwner) && (
          <InfoTile label="Test Owner" value={testCase.testOwner} mono />
        )}
        {hasText(testCase.linkedTicket) && (
          <InfoTile label="Linked Ticket" value={testCase.linkedTicket} mono />
        )}
        {typeof testCase.estimatedDurationMins === 'number' && (
          <InfoTile
            label="Est. Duration"
            value={`${testCase.estimatedDurationMins} min`}
          />
        )}
        {createdAt && <InfoTile label="Created" value={createdAt} />}
        {updatedAt && <InfoTile label="Updated" value={updatedAt} />}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function APIDetails({ testCase }: { testCase: TestCase }) {
  const orgId = useCurrentOrganization().id
  const api = testCase.api
  const { serviceId, apiGroupId } = parseApiSpecValue(api?.apiSpecId)

  const { data: endpointsData } = useQuery(API_ENDPOINTS, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: {
      orgId: orgId!,
      serviceId,
      apiGroupId,
    },
    skip: !orgId || !serviceId || !apiGroupId,
  })

  const endpointLabel = useMemo(() => {
    if (!api?.operationId || !endpointsData) return null
    const options = deriveRestEndpointOptions(
      endpointsToLegacyWithMeta(
        arrayNonNullable(endpointsData.apiEndpoints),
        orgId!
      )
    )
    return options.find((o) => o.value === api.operationId)?.label ?? null
  }, [api?.operationId, endpointsData, orgId])

  if (!api) return null

  const method = (api.httpMethod ?? 'GET').toUpperCase()
  const methodBg =
    method === 'GET'
      ? 'bg-blue-50 text-blue-700'
      : method === 'POST'
        ? 'bg-green-50 text-green-700'
        : method === 'DELETE'
          ? 'bg-red-50 text-red-700'
          : 'bg-amber-50 text-amber-700'

  return (
    <>
      <div className="border-border mb-4 flex items-center gap-0 overflow-hidden rounded-lg border bg-white">
        <div className="border-border bg-shading-gray flex shrink-0 border-r px-3 py-2.5">
          <span
            className={`rounded px-2 py-0.5 font-mono text-xs font-medium ${methodBg}`}
          >
            {method}
          </span>
        </div>
        <div className="text-foreground/75 overflow-x-auto px-3 py-2.5 font-mono text-sm leading-[1.33] whitespace-nowrap">
          {endpointLabel
            ? endpointLabel.replace(/^[A-Z]+\s+/, '')
            : (api.operationId ?? testCase.title ?? 'API Test')}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {typeof api.expectedStatusCode === 'number' && (
          <InfoTile
            label="Expected Status Code"
            value={api.expectedStatusCode}
            mono
          />
        )}
        {typeof api.maxResponseTimeMs === 'number' && (
          <InfoTile
            label="Max Response Time"
            value={`${api.maxResponseTimeMs}ms`}
            mono
          />
        )}
        {hasText(api.auth?.type) && (
          <InfoTile label="Auth" value={api.auth.type} />
        )}
      </div>

      {api.requestHeaders && api.requestHeaders.length > 0 && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Request Headers
          </Label>
          <KeyValueList items={api.requestHeaders} />
        </div>
      )}

      {api.queryParams && api.queryParams.length > 0 && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Query Parameters
          </Label>
          <KeyValueList items={api.queryParams} />
        </div>
      )}

      {(hasText(api.auth?.bearerToken) ||
        hasText(api.auth?.apiKeyValue) ||
        hasText(api.auth?.basicUsername) ||
        hasText(api.auth?.basicPassword)) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Auth Values
          </Label>
          <KeyValueList
            items={[
              { key: 'Bearer Token', value: api.auth?.bearerToken },
              { key: api.auth?.apiKeyHeader, value: api.auth?.apiKeyValue },
              { key: 'Basic Username', value: api.auth?.basicUsername },
              { key: 'Basic Password', value: api.auth?.basicPassword },
            ]}
          />
        </div>
      )}

      {hasText(api.requestBody) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Request Body
          </Label>
          <CodeBlock value={api.requestBody} />
        </div>
      )}

      {hasText(api.responseBody) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Expected Response Body
          </Label>
          <CodeBlock value={api.responseBody} />
        </div>
      )}

      {api.assertions && api.assertions.length > 0 && (
        <div>
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Assertions
          </Label>
          <AssertionList assertions={api.assertions} />
        </div>
      )}
    </>
  )
}

function GraphQLDetails({ testCase }: { testCase: TestCase }) {
  const gql = testCase.graphql
  if (!gql) return null

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <InfoTile label="Operation Type" value={gql.operationType ?? '-'} />
        {hasText(gql.operationName) && (
          <InfoTile label="Operation Name" value={gql.operationName} mono />
        )}
        <InfoTile label="Expect Error" value={gql.expectError ? 'Yes' : 'No'} />
      </div>

      {hasText(gql.query) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Query
          </Label>
          <CodeBlock value={gql.query} languageLabel="GraphQL" rows={7} />
        </div>
      )}

      {hasText(gql.variables) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Variables
          </Label>
          <CodeBlock value={gql.variables} rows={3} />
        </div>
      )}

      {hasText(gql.responseBody) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Expected Response Body
          </Label>
          <CodeBlock value={gql.responseBody} rows={5} />
        </div>
      )}

      {gql.assertions && gql.assertions.length > 0 && (
        <div>
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Assertions
          </Label>
          <AssertionList assertions={gql.assertions} />
        </div>
      )}
    </>
  )
}

function DatabaseDetails({ testCase }: { testCase: TestCase }) {
  const db = testCase.database
  if (!db) return null

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <InfoTile label="Dialect" value={db.dialect ?? '-'} />
      </div>

      {hasText(db.query) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Query
          </Label>
          <CodeBlock value={db.query} languageLabel="SQL" rows={5} />
        </div>
      )}

      {db.assertions && db.assertions.length > 0 && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Assertions
          </Label>
          <AssertionList assertions={db.assertions} />
        </div>
      )}

      {hasText(db.setupQuery) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Setup Query
          </Label>
          <CodeBlock value={db.setupQuery} languageLabel="SQL" rows={3} />
        </div>
      )}

      {hasText(db.teardownQuery) && (
        <div>
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Teardown Query
          </Label>
          <CodeBlock value={db.teardownQuery} languageLabel="SQL" rows={3} />
        </div>
      )}
    </>
  )
}

function GRPCDetails({ testCase }: { testCase: TestCase }) {
  const grpc = testCase.grpc
  if (!grpc) return null

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {hasText(grpc.serviceName) && (
          <InfoTile label="Service" value={grpc.serviceName} mono />
        )}
        {hasText(grpc.methodName) && (
          <InfoTile label="Method" value={grpc.methodName} mono />
        )}
        {hasText(grpc.callMode) && (
          <InfoTile label="Call Mode" value={grpc.callMode} />
        )}
        {hasText(grpc.expectedStatus) && (
          <InfoTile label="Expected Status" value={grpc.expectedStatus} mono />
        )}
        {typeof grpc.deadlineMs === 'number' && (
          <InfoTile label="Deadline" value={`${grpc.deadlineMs}ms`} mono />
        )}
        <InfoTile label="TLS" value={grpc.useTLS ? 'On' : 'Off'} />
        <InfoTile
          label="Expect Error"
          value={grpc.expectError ? 'Yes' : 'No'}
        />
      </div>

      {grpc.metadata && grpc.metadata.length > 0 && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Metadata Headers
          </Label>
          <KeyValueList items={grpc.metadata} />
        </div>
      )}

      {hasText(grpc.requestMessage) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Request Message
          </Label>
          <CodeBlock value={grpc.requestMessage} rows={5} />
        </div>
      )}

      {hasText(grpc.responseBody) && (
        <div className="mb-4">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Expected Response Body
          </Label>
          <CodeBlock value={grpc.responseBody} rows={4} />
        </div>
      )}

      {grpc.assertions && grpc.assertions.length > 0 && (
        <div>
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Assertions
          </Label>
          <AssertionList assertions={grpc.assertions} />
        </div>
      )}
    </>
  )
}

function ManualDetails({ testCase }: { testCase: TestCase }) {
  const manual = testCase.manual
  const steps = manual?.steps
    ? [...manual.steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : []

  return (
    <>
      {hasText(manual?.preconditions) && (
        <div className="mb-6">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Preconditions
          </Label>
          <RichTextEditor
            value={toDelta(manual?.preconditions)}
            setValue={() => {}}
            noOverflow
            readonly
          />
        </div>
      )}

      {hasText(manual?.testData) && (
        <div className="mb-6">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Test Data Required
          </Label>
          <RichTextEditor
            value={toDelta(manual?.testData)}
            setValue={() => {}}
            noOverflow
            readonly
          />
        </div>
      )}

      {steps.length > 0 && (
        <div className="mb-6">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Steps
          </Label>
          <div className="flex flex-col gap-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="border-border bg-muted/15 flex gap-3 rounded-xl border p-4"
              >
                <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {(step.order ?? idx) + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {hasText(step.action) && (
                    <div className="text-foreground text-sm leading-[1.33] whitespace-pre-wrap">
                      {step.action}
                    </div>
                  )}
                  {hasText(step.expectedResult) && (
                    <div className="text-muted-foreground text-sm leading-[1.33] whitespace-pre-wrap">
                      <span className="text-foreground font-medium">
                        Expected:{' '}
                      </span>
                      {step.expectedResult}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasText(manual?.expectedOutcome) && (
        <div className="mb-6">
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Expected Outcome
          </Label>
          <RichTextEditor
            value={toDelta(manual?.expectedOutcome)}
            setValue={() => {}}
            noOverflow
            readonly
          />
        </div>
      )}

      {hasText(manual?.postconditions) && (
        <div>
          <Label className="text-foreground mb-2 block text-sm font-normal">
            Postconditions / Cleanup
          </Label>
          <RichTextEditor
            value={toDelta(manual?.postconditions)}
            setValue={() => {}}
            noOverflow
            readonly
          />
        </div>
      )}
    </>
  )
}

type TestInspectorDetailsProps = {
  testCase: TestCase
  testPack: V2.TestPack | null
}

export function TestInspectorDetails({
  testCase,
  testPack,
}: TestInspectorDetailsProps) {
  const type = (testCase.type ?? '').toLowerCase()

  return (
    <div className="bg-muted/20 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3">
      <Overview testCase={testCase} testPack={testPack} />

      <div className="flex flex-col gap-1">
        <SectionLabel>Definition</SectionLabel>
        {type === 'api' && <APIDetails testCase={testCase} />}
        {type === 'graphql' && <GraphQLDetails testCase={testCase} />}
        {type === 'database' && <DatabaseDetails testCase={testCase} />}
        {type === 'grpc' && <GRPCDetails testCase={testCase} />}
        {type === 'manual' && <ManualDetails testCase={testCase} />}
        {!['api', 'graphql', 'database', 'grpc', 'manual'].includes(type) && (
          <p className="text-muted-foreground text-sm">
            No definition available for this test type.
          </p>
        )}
      </div>
    </div>
  )
}
