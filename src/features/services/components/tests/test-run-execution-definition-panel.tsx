'use client'

import type { TestCase } from '@/api/.gql/graphql'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { CodeMirrorWrapped, RichTextEditor } from '@/features/component-meta'
import { FOCAL_POINTS } from '@/features/dashboard-pages/api/focal-point'
import { FRAME_BY_ID } from '@/features/dashboard-projects/api/frame'
import { MAP } from '@/features/dashboard-projects/api/map'
import { useAssetUrls } from '@/features/uploads/api/uploads'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format } from 'date-fns'
import { CircleDot, LayoutPanelTop, Monitor } from 'lucide-react'
import { Delta } from 'quill'
import { LuChevronRight } from 'react-icons/lu'
import { ACTOR } from '../../api/actor'
import { getPriorityDisplay } from './run-step-result-row'

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
    <div className="rounded-[12px] border border-[#2A3242] bg-[#141925] px-4 py-3">
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
    <div className="overflow-hidden rounded-[12px] border border-[#2A3242] bg-[#141925]">
      <div className="border-b border-[#2A3242] bg-[#141925] px-3 py-2">
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
          className="flex flex-wrap items-center gap-2 rounded-[12px] border border-[#2A3242] bg-[#141925] px-3 py-2 text-sm"
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

function KeyValueList({
  items,
}: {
  items: Array<{ key?: string | null; value?: string | null }>
}) {
  if (!items?.length) return null
  return (
    <div className="flex flex-col gap-1">
      {items.map((kv, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center gap-2 rounded-[12px] border border-[#2A3242] bg-[#141925] px-3 py-2 text-sm"
        >
          <span className="text-foreground font-mono font-semibold">
            {kv.key}
          </span>
          <span className="text-muted-foreground font-mono">{kv.value}</span>
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
      <div className="mb-5 flex items-center gap-0 overflow-hidden rounded-[12px] border border-[#2A3242] bg-[#141925]">
        <div className="flex shrink-0 border-r border-[#2A3242] bg-[#141925] px-3 py-2.5">
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
      {typeof api.maxResponseTimeMs === 'number' && (
        <div className="mb-5">
          <InfoTile
            label="Max Response Time"
            value={`${api.maxResponseTimeMs}ms`}
            mono
          />
        </div>
      )}
      {api.requestHeaders && api.requestHeaders.length > 0 && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Headers
          </Label>
          <KeyValueList items={api.requestHeaders} />
        </div>
      )}
      {api.queryParams && api.queryParams.length > 0 && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Query Parameters
          </Label>
          <KeyValueList items={api.queryParams} />
        </div>
      )}
      {api.requestBody && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Request Body
          </Label>
          <CodeBlock value={api.requestBody} />
        </div>
      )}
      {api.responseBody && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Expected Response Body
          </Label>
          <CodeBlock value={api.responseBody} />
        </div>
      )}
      {api.assertions && api.assertions.length > 0 && (
        <div>
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Assertions
          </Label>
          <AssertionList assertions={api.assertions} />
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
        <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-[#2A3242] bg-[#141925] px-4 py-3">
          <span className="text-foreground font-mono text-sm font-semibold">
            ⟁ {grpc.protoFileId}
          </span>
        </div>
      )}
      {grpc.metadata && grpc.metadata.length > 0 && (
        <div className="mb-4">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Metadata
          </Label>
          <KeyValueList items={grpc.metadata} />
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
                className="flex gap-3 rounded-[12px] border border-[#2A3242] bg-[#141925] p-4"
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

function ReferenceScreenshots({
  orgId,
  assetIds,
}: {
  orgId?: string
  assetIds: string[]
}) {
  const assetUrlMap = useAssetUrls(orgId, assetIds)
  return (
    <div className="grid grid-cols-3 gap-2">
      {assetIds.map((assetId) => (
        <img
          key={assetId}
          src={assetUrlMap[assetId] ?? ''}
          alt="Reference screenshot"
          className="h-20 w-full rounded-[10px] border border-[#2A3242] object-cover"
        />
      ))}
    </div>
  )
}

function LinkedUiNode({
  orgId,
  linkedMapNodeId,
}: {
  orgId?: string
  linkedMapNodeId: string
}) {
  const [mapId = '', screenId = '', focalPointId = ''] =
    linkedMapNodeId.split(':')

  const { data: mapData } = useQuery(MAP, {
    variables: { orgId: orgId!, id: mapId },
    skip: !orgId || !mapId,
    fetchPolicy: 'cache-first',
  })
  const { data: frameData } = useQuery(FRAME_BY_ID, {
    variables: { orgId: orgId!, id: screenId },
    skip: !orgId || !screenId,
    fetchPolicy: 'cache-first',
  })
  const { data: focalPointsData } = useQuery(FOCAL_POINTS, {
    variables: { orgId: orgId!, mapId, frameId: screenId },
    skip: !orgId || !mapId || !screenId,
    fetchPolicy: 'cache-first',
  })

  if (!mapId || !screenId || !focalPointId) return null

  const focalPoint = focalPointsData?.focalPoints?.find(
    (fp) => fp?.id === focalPointId
  )

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-[12px] border border-[#2A3242] bg-[#141925] px-4 py-3 text-sm">
      <LayoutPanelTop className="text-foreground/75 size-3.5" />
      <span className="text-foreground">
        {mapData?.map?.name?.trim() || 'Untitled Map'}
      </span>
      <LuChevronRight className="text-foreground/50 size-3.5" />
      <Monitor className="text-foreground/75 size-3.5" />
      <span className="text-foreground">
        {frameData?.frameById?.name?.trim() || 'Untitled Screen'}
      </span>
      <LuChevronRight className="text-foreground/50 size-3.5" />
      <CircleDot className="text-foreground/75 size-3.5" />
      <span className="text-foreground">
        {focalPoint?.name?.trim() || 'Untitled Focal Point'}
      </span>
    </div>
  )
}

function AuthorInfo({
  orgId,
  createdBy,
  createdAt,
}: {
  orgId?: string
  createdBy: string
  createdAt?: string | null
}) {
  const { data } = useQuery(ACTOR, {
    variables: { orgId: orgId!, id: createdBy },
    skip: !orgId || !createdBy,
    fetchPolicy: 'cache-first',
  })
  const name = data?.actor?.name?.trim() || createdBy
  const avatarUrl = data?.actor?.avatarUrl || ''

  return (
    <div className="flex items-center gap-2 rounded-[12px] border border-[#2A3242] bg-[#141925] px-4 py-3 text-sm">
      <Avatar className="size-5">
        <AvatarImage src={avatarUrl} className="object-cover" />
        <AvatarFallback className="text-[10px]">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-foreground">{name}</span>
      {createdAt && (
        <span className="text-muted-foreground">
          · {format(new Date(createdAt), 'MMM d, yyyy')}
        </span>
      )}
    </div>
  )
}

export function TestRunExecutionDefinitionPanel({
  testCase,
}: {
  testCase: TestCase
}) {
  const type = (testCase.type ?? '').toLowerCase()
  const orgId = useCurrentOrganization()?.id
  const priority = testCase.priority
    ? getPriorityDisplay(testCase.priority)
    : null
  const screenshotAssetIds = testCase.screenshotUrls ?? []

  return (
    <div className="flex flex-col">
      <SectionLabel>Definition</SectionLabel>
      {testCase.description && (
        <div className="text-muted-foreground mb-5 rounded-[12px] border border-[#2A3242] bg-[#141925] px-4 py-3 text-sm leading-[1.6]">
          {testCase.description}
        </div>
      )}

      {(priority ||
        testCase.testOwner ||
        testCase.estimatedDurationMins != null ||
        testCase.linkedTicket) && (
        <div className="mb-5 grid grid-cols-2 gap-3">
          {priority && <InfoTile label="Priority" value={priority.label} />}
          {testCase.testOwner && (
            <InfoTile label="Test Owner" value={testCase.testOwner} />
          )}
          {testCase.estimatedDurationMins != null && (
            <InfoTile
              label="Estimated Duration"
              value={`${testCase.estimatedDurationMins} min`}
              mono
            />
          )}
          {testCase.linkedTicket && (
            <InfoTile
              label="Linked Ticket"
              value={testCase.linkedTicket}
              mono
            />
          )}
        </div>
      )}

      {testCase.labels && testCase.labels.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {testCase.labels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {label}
            </Badge>
          ))}
        </div>
      )}

      {screenshotAssetIds.length > 0 && (
        <div className="mb-5">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Reference Screenshots
          </Label>
          <ReferenceScreenshots orgId={orgId} assetIds={screenshotAssetIds} />
        </div>
      )}

      {testCase.linkedMapNodeId && (
        <div className="mb-5">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Linked UI Node
          </Label>
          <LinkedUiNode
            orgId={orgId}
            linkedMapNodeId={testCase.linkedMapNodeId}
          />
        </div>
      )}

      {testCase.createdBy && (
        <div className="mb-5">
          <Label className="text-foreground mb-1.5 block text-xs font-semibold">
            Author
          </Label>
          <AuthorInfo
            orgId={orgId}
            createdBy={testCase.createdBy}
            createdAt={testCase.createdAt}
          />
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
