'use client'

import type { TestCase } from '@/api/.gql/graphql'
import { Label } from '@/components/ui/label'
import { CodeMirrorWrapped, RichTextEditor } from '@/features/component-meta'
import { Delta } from 'quill'

function toDelta(v: string | null | undefined): Delta | string {
  if (!v) return ''
  try {
    const ops = JSON.parse(v)
    return Array.isArray(ops) ? new Delta(ops) : v
  } catch {
    return v
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
      {children}
    </div>
  )
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
    <div className="rounded-[12px] border border-[#E5E7E9] bg-white px-4 py-3">
      <div className="text-muted-foreground mb-1.5 text-xs font-medium">
        {label}
      </div>
      <div
        className={
          mono ? 'text-foreground font-mono text-sm' : 'text-foreground text-sm'
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
  if (!value?.trim()) return null
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#E5E7E9] bg-white">
      <div className="border-b border-[#E5E7E9] bg-[#F9FBFC] px-3 py-2">
        <span className="text-muted-foreground font-mono text-xs">
          {languageLabel}
        </span>
      </div>
      <CodeMirrorWrapped
        value={value}
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
  if (!assertions?.length) return null
  return (
    <div className="flex flex-col gap-1">
      {assertions.map((a, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center gap-2 rounded-[12px] border border-[#E5E7E9] bg-[#F9FBFC] px-3 py-2 text-sm"
        >
          {a.field && (
            <span className="text-foreground font-mono font-semibold">
              {a.field}
            </span>
          )}
          {a.type && <span className="text-muted-foreground">{a.type}</span>}
          {a.value != null && a.value !== '' && (
            <span className="text-foreground font-mono font-semibold">
              &quot;{a.value}&quot;
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function APIDefinition({ testCase }: { testCase: TestCase }) {
  const api = testCase.api
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

  const authLabel =
    api.auth?.type === 'bearer'
      ? 'Bearer Token'
      : api.auth?.type
        ? String(api.auth.type)
        : 'None'

  return (
    <>
      <div className="mb-5 flex items-center gap-0 overflow-hidden rounded-[12px] border border-[#E5E7E9] bg-white">
        <div className="flex shrink-0 border-r border-[#E5E7E9] bg-[#F9FBFC] px-3 py-2.5">
          <span
            className={`rounded px-2 py-0.5 font-mono text-xs font-extrabold ${methodBg}`}
          >
            {method}
          </span>
        </div>
        <div className="text-foreground/75 truncate px-3 py-2.5 font-mono text-sm">
          {api.operationId ?? '—'}
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <InfoTile
          label="Expected Status Code"
          value={api.expectedStatusCode ?? '—'}
          mono
        />
        <InfoTile label="Auth" value={authLabel} />
      </div>
      {api.requestBody && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Request Body
          </Label>
          <CodeBlock value={api.requestBody} />
        </div>
      )}
      {api.responseBody && (
        <div>
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Expected Response Body
          </Label>
          <CodeBlock value={api.responseBody} />
        </div>
      )}
    </>
  )
}

function GraphQLDefinition({ testCase }: { testCase: TestCase }) {
  const gql = testCase.graphql
  if (!gql) return null

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <InfoTile label="Operation Type" value={gql.operationType ?? '—'} />
        <InfoTile
          label="Operation Name"
          value={gql.operationName ?? '—'}
          mono
        />
      </div>
      {gql.query && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Query
          </Label>
          <CodeBlock value={gql.query} languageLabel="GraphQL" rows={7} />
        </div>
      )}
      {gql.variables && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Variables
          </Label>
          <CodeBlock value={gql.variables} rows={3} />
        </div>
      )}
      {gql.responseBody && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Expected Response Body
          </Label>
          <CodeBlock value={gql.responseBody} rows={5} />
        </div>
      )}
      {gql.assertions && gql.assertions.length > 0 && (
        <div>
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Assertions
          </Label>
          <AssertionList assertions={gql.assertions} />
        </div>
      )}
    </>
  )
}

function DatabaseDefinition({ testCase }: { testCase: TestCase }) {
  const db = testCase.database
  if (!db) return null

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <InfoTile label="Dialect" value={db.dialect ?? '—'} />
        <InfoTile label="Linked Schema" value={db.schemaId ?? '—'} />
      </div>
      {db.query && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Query
          </Label>
          <CodeBlock value={db.query} languageLabel="SQL" rows={5} />
        </div>
      )}
      {db.assertions && db.assertions.length > 0 && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Assertions
          </Label>
          <AssertionList assertions={db.assertions} />
        </div>
      )}
      {db.setupQuery && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Setup Query{' '}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <CodeBlock value={db.setupQuery} languageLabel="SQL" rows={2} />
        </div>
      )}
      {db.teardownQuery && (
        <div>
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Teardown Query{' '}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <CodeBlock value={db.teardownQuery} languageLabel="SQL" rows={2} />
        </div>
      )}
    </>
  )
}

function GRPCDefinition({ testCase }: { testCase: TestCase }) {
  const grpc = testCase.grpc
  if (!grpc) return null

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <InfoTile label="Service" value={grpc.serviceName ?? '—'} mono />
        <InfoTile label="Method" value={grpc.methodName ?? '—'} mono />
      </div>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <InfoTile label="Call Mode" value={grpc.callMode ?? '—'} />
        <InfoTile
          label="Expected Status"
          value={grpc.expectedStatus ?? '—'}
          mono
        />
        <InfoTile
          label="Deadline"
          value={grpc.deadlineMs != null ? `${grpc.deadlineMs}ms` : '—'}
          mono
        />
      </div>
      {grpc.protoFileId && (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-[#E5E7E9] bg-white px-4 py-3">
          <span className="text-foreground font-mono text-sm font-semibold">
            ⟁ {grpc.protoFileId}
          </span>
        </div>
      )}
      {grpc.requestMessage && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Request Message
          </Label>
          <CodeBlock value={grpc.requestMessage} rows={5} />
        </div>
      )}
      {grpc.responseBody && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Expected Response Body
          </Label>
          <CodeBlock value={grpc.responseBody} rows={4} />
        </div>
      )}
      {grpc.assertions && grpc.assertions.length > 0 && (
        <div>
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Assertions
          </Label>
          <AssertionList assertions={grpc.assertions} />
        </div>
      )}
    </>
  )
}

function ManualDefinition({ testCase }: { testCase: TestCase }) {
  const manual = testCase.manual
  const steps = manual?.steps
  const sortedSteps = steps
    ? [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : []

  return (
    <>
      {manual?.preconditions && (
        <div className="mb-6">
          <Label className="text-foreground mb-2 block text-sm font-medium">
            Preconditions
          </Label>

          <RichTextEditor
            value={toDelta(manual.preconditions)}
            setValue={() => {}}
            noOverflow
            readonly
          />
        </div>
      )}
      {sortedSteps.length > 0 && (
        <div className="mb-6">
          <Label className="text-foreground mb-2 block text-sm font-medium">
            Steps
          </Label>
          <div className="flex flex-col gap-3">
            {sortedSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-[12px] border border-[#E5E7E9] bg-white p-4"
              >
                <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {(step.order ?? idx) + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="text-foreground text-sm leading-[1.6]">
                    <RichTextEditor
                      value={toDelta(step.action)}
                      setValue={() => {}}
                      noOverflow
                      readonly
                    />
                  </div>
                  {step.expectedResult != null &&
                    String(step.expectedResult).trim() !== '' && (
                      <div className="text-muted-foreground text-sm leading-[1.6]">
                        <span className="font-medium not-italic">
                          Expected:{' '}
                        </span>
                        <span className="italic">
                          <RichTextEditor
                            value={toDelta(step.expectedResult)}
                            setValue={() => {}}
                            noOverflow
                            readonly
                          />
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {manual?.expectedOutcome && (
        <div>
          <Label className="text-foreground mb-2 block text-sm font-medium">
            Expected Outcome
          </Label>

          <RichTextEditor
            value={toDelta(manual.expectedOutcome)}
            setValue={() => {}}
            noOverflow
            readonly
          />
        </div>
      )}
    </>
  )
}

export function TestRunExecutionDefinitionPanel({
  testCase,
}: {
  testCase: TestCase
}) {
  const type = (testCase.type ?? '').toLowerCase()

  return (
    <div className="flex flex-col">
      <SectionLabel>Definition</SectionLabel>
      {testCase.description && (
        <div className="text-muted-foreground mb-5 rounded-[12px] border border-[#E5E7E9] bg-white px-4 py-3 text-sm leading-[1.6]">
          {testCase.description}
        </div>
      )}
      {type === 'api' && <APIDefinition testCase={testCase} />}
      {type === 'graphql' && <GraphQLDefinition testCase={testCase} />}
      {type === 'database' && <DatabaseDefinition testCase={testCase} />}
      {type === 'grpc' && <GRPCDefinition testCase={testCase} />}
      {type === 'manual' && <ManualDefinition testCase={testCase} />}
      {!['api', 'graphql', 'database', 'grpc', 'manual'].includes(type) && (
        <p className="text-muted-foreground text-sm">
          No definition available for this test type.
        </p>
      )}
    </div>
  )
}
