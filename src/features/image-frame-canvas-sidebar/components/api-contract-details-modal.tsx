import { GT } from '@/api'
import { MethodBadge } from '@/components/api/method-badge'
import { BetterDialogContent } from '@/components/better-dialog'
import { CodeMirrorRaw } from '@/components/code-mirror'
import {
  CodeMirrorWrapped,
  ComponentInputType,
  ComponentMetaField,
  ComponentMetaThemeProvider,
  TextAreaInput,
  TextInput,
  URLInput,
} from '@/features/component-meta'
import { endpointToLegacyWithMeta } from '@/features/services/api/api-adapters'
import {
  API_GROUP,
  type DashboardAPIEndpoint,
} from '@/features/services/api/api-endpoints'
import { cn } from '@/lib/utils'
import {
  formatMetaSchemaForDisplay,
  formatSampleForDisplay,
} from '@/utils/api/openapi-display'
import { useQuery } from '@apollo/client'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { API_ENDPOINT_BY_ID } from '../api/component-link-nav'

type ApiContractDetailsModalProps = {
  orgId: string
  endpointId: string
}

export function ApiContractDetailsModal({
  orgId,
  endpointId,
}: ApiContractDetailsModalProps) {
  const { data, loading } = useQuery(API_ENDPOINT_BY_ID, {
    variables: { orgId, id: endpointId },
    fetchPolicy: 'cache-first',
  })

  const endpoint = data?.apiEndpointById

  const { data: groupData } = useQuery(API_GROUP, {
    variables: {
      orgId,
      serviceId: endpoint?.serviceId ?? '',
      id: endpoint?.apiGroupId ?? '',
    },
    fetchPolicy: 'cache-first',
    skip: !endpoint,
  })

  const protocolRaw = groupData?.apiGroup?.protocol ?? 'REST'
  const protocol = protocolRaw.toLowerCase()

  if (loading) {
    return (
      <BetterDialogContent title="API Contract">
        <div className="flex items-center gap-2 px-6 py-10">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-paragraph text-sm">
            Loading API contract...
          </span>
        </div>
      </BetterDialogContent>
    )
  }

  if (!endpoint) {
    return (
      <BetterDialogContent title="API Contract">
        <div className="text-paragraph px-6 py-10 text-sm">
          API contract not found.
        </div>
      </BetterDialogContent>
    )
  }

  return (
    <ApiContractDetailsModalContent
      orgId={orgId}
      endpoint={endpoint}
      protocol={protocol}
      protocolLabel={protocolRaw}
    />
  )
}

function ApiContractDetailsModalContent({
  orgId,
  endpoint,
  protocol,
  protocolLabel,
}: {
  orgId: string
  endpoint: NonNullable<GT.ApiEndpointByIdQuery['apiEndpointById']>
  protocol: string
  protocolLabel: string
}) {
  const legacy = useMemo(() => {
    const dashboardEndpoint: DashboardAPIEndpoint = {
      id: endpoint.id,
      apiGroupId: endpoint.apiGroupId,
      serviceId: endpoint.serviceId,
      orgId,
      operationId: '',
      method: endpoint.method,
      path: endpoint.path,
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: endpoint.responses,
      exampleRequests: endpoint.exampleRequests,
      exampleResponses: endpoint.exampleResponses,
      order: 0,
      createdBy: '',
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
    }
    return endpointToLegacyWithMeta(dashboardEndpoint, orgId, protocol)
  }, [endpoint, orgId, protocol])

  const fields = useMemo(
    () => arrayNonNullable(legacy.componentMeta.componentModalFields),
    [legacy.componentMeta.componentModalFields]
  )

  const flattened = useMemo(() => flattenMetaData(fields, fields), [fields])

  const visibleFields = useMemo(
    () =>
      fields.filter((field) => {
        const value = field.componentFieldId
          ? flattened[field.componentFieldId]
          : null
        return typeof value === 'string' && value.trim().length > 0
      }),
    [fields, flattened]
  )

  const exampleRequests = useMemo(
    () => arrayNonNullable(legacy.apiEndpoint.exampleRequests),
    [legacy.apiEndpoint.exampleRequests]
  )
  const exampleResponses = useMemo(
    () => arrayNonNullable(legacy.apiEndpoint.exampleResponses),
    [legacy.apiEndpoint.exampleResponses]
  )

  const tags = arrayNonNullable(endpoint.tags).filter(Boolean)

  const updatedLabel = endpoint.updatedAt
    ? new Date(endpoint.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <BetterDialogContent
      className="p-0"
      title={
        <span className="flex items-center gap-2">
          <MethodBadge method={endpoint.method || 'N/A'} />
          <span className="font-mono break-all">{endpoint.path}</span>
        </span>
      }
      description={
        <span className="text-paragraph text-xs">
          {endpoint.summary?.trim() ||
            (updatedLabel ? `Updated ${updatedLabel}` : protocolLabel)}
        </span>
      }
      footerCancel="Close"
      footerSubmit="Open API Endpoint"
      footerAlign="between"
      onFooterSubmitClick={() =>
        window.open(
          `/services/${endpoint.serviceId}/apis/${endpoint.apiGroupId}`
        )
      }
    >
      <div className="max-h-[70vh] space-y-8 overflow-y-auto px-6 py-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="bg-primary/15 text-primary rounded-md px-2 py-1 text-xs font-medium">
            {protocolLabel}
          </span>

          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#1E2533] px-2 py-1 text-xs font-medium text-[#828DA3]"
            >
              {tag}
            </span>
          ))}
        </div>

        {visibleFields.length > 0 && (
          <ComponentMetaThemeProvider theme="modal">
            <div className="space-y-1">
              {visibleFields.map((field, index) => {
                const value = field.componentFieldId
                  ? String(flattened[field.componentFieldId] ?? '')
                  : ''

                return (
                  <ComponentMetaField
                    key={field.componentFieldId ?? index}
                    label={field.label ?? 'Field'}
                    required={false}
                    componentType={field.type ?? 'unknown'}
                    error={null}
                  >
                    {field.type === ComponentInputType.CodeEditor ? (
                      <CodeMirrorWrapped
                        readonly
                        value={formatMetaSchemaForDisplay(
                          field.label ?? '',
                          value,
                          protocol
                        )}
                        setValue={() => undefined}
                      />
                    ) : field.type === ComponentInputType.TextBox ? (
                      <TextAreaInput
                        readonly
                        value={value}
                        onChange={() => undefined}
                      />
                    ) : field.type === ComponentInputType.URLInput ? (
                      <URLInput
                        readonly
                        value={value}
                        onChange={() => undefined}
                      />
                    ) : (
                      <TextInput
                        readonly
                        value={value}
                        onChange={() => undefined}
                      />
                    )}
                  </ComponentMetaField>
                )
              })}
            </div>
          </ComponentMetaThemeProvider>
        )}

        {exampleRequests.length > 0 && (
          <SampleGroup
            label="Example Requests"
            samples={exampleRequests}
            protocol={protocol}
            kind="request"
          />
        )}

        {exampleResponses.length > 0 && (
          <SampleGroup
            label="Example Responses"
            samples={exampleResponses}
            protocol={protocol}
            kind="response"
          />
        )}
      </div>
    </BetterDialogContent>
  )
}

function SampleGroup({
  label,
  samples,
  protocol,
  kind,
}: {
  label: string
  samples: string[]
  protocol: string
  kind: 'request' | 'response'
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = samples[activeIndex] ?? samples[0]

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium tracking-wider text-[#828DA3] uppercase">
          {label}
        </div>

        {samples.length > 1 && (
          <div className="flex items-center gap-1">
            {samples.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'rounded px-2 py-0.5 text-xs',
                  index === activeIndex
                    ? 'bg-primary/15 text-primary'
                    : 'text-paragraph hover:bg-[#1E2533]'
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <CodeMirrorRaw
        editable={false}
        value={formatSampleForDisplay(active, protocol, kind)}
        className="overflow-hidden rounded-lg border border-[#2A3242]"
      />
    </div>
  )
}
