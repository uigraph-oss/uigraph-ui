'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { SuperCircleLoader } from '@/components/loader'
import { Table, TableBody } from '@/components/ui/table'
import { VersionLayout } from '@/components/version-layout'
import {
  LegacyApiEndpoint,
  LegacyComponentMeta,
} from '@/features/services/api/api-adapters'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../contexts/service-api-endpoints'
import { useVersionEndpoints } from '../../hooks/use-api-version-endpoints'
import { CompareApiEndpointDetailsModal } from './compare-api-endpoint-details-modal'
import { ApiEndPointRowReadonly } from './rows/api-end-point-row'
import { GraphQLOperationRowReadonly } from './rows/graphql-operation-row'
import { GrpcMethodRowReadonly } from './rows/grpc-method-row'

export function CompareApiGroupVersionsModal() {
  const { apiGroup, apiGroupVersions, serviceApiGroupId, selectedVersionId } =
    useServiceApiEndpointsContext()

  const [selectedEndpointKey, setSelectedEndpointKey] = useState<string | null>(
    null
  )

  const firstVersionId =
    apiGroupVersions.find((v) => v.versionId != null)?.versionId ?? null

  const [selectedVersionAId, setSelectedVersionAId] = useState<string | null>(
    () => selectedVersionId ?? firstVersionId
  )

  const [selectedVersionBId, setSelectedVersionBId] = useState<string | null>(
    () => firstVersionId
  )

  const protocol = useMemo(() => {
    if (apiGroup?.protocol) {
      return apiGroup.protocol.toLowerCase()
    }
    if (apiGroup?.graphqlSpecFileIds && apiGroup.graphqlSpecFileIds.length > 0)
      return 'graphql'
    if (apiGroup?.grpcSpecFileIds && apiGroup.grpcSpecFileIds.length > 0)
      return 'grpc'
    if (apiGroup?.openApiSpecFileId || apiGroup?.swaggerSpecFileId)
      return 'rest'
    return 'rest'
  }, [apiGroup])

  const { versionAGroupId, versionANumber } = useMemo(() => {
    if (selectedVersionAId == null) {
      // Latest (current) endpoints for the group
      return { versionAGroupId: serviceApiGroupId, versionANumber: null }
    }
    const version = apiGroupVersions.find(
      (v) => v.versionId === selectedVersionAId
    )
    return {
      versionAGroupId: serviceApiGroupId,
      versionANumber: version?.versionNumber ?? null,
    }
  }, [selectedVersionAId, apiGroupVersions, serviceApiGroupId])

  const { versionBGroupId, versionBNumber } = useMemo(() => {
    if (selectedVersionBId == null) {
      return { versionBGroupId: serviceApiGroupId, versionBNumber: null }
    }
    const version = apiGroupVersions.find(
      (v) => v.versionId === selectedVersionBId
    )
    return {
      versionBGroupId: serviceApiGroupId,
      versionBNumber: version?.versionNumber ?? null,
    }
  }, [selectedVersionBId, apiGroupVersions, serviceApiGroupId])

  const { serviceId } = useServiceApiEndpointsContext()

  const versionA = useVersionEndpoints(
    serviceId,
    versionAGroupId,
    versionANumber ?? null
  )
  const versionB = useVersionEndpoints(
    serviceId,
    versionBGroupId,
    versionBNumber ?? null
  )

  const versionAName = useMemo(() => {
    if (selectedVersionAId === null) return 'Latest'
    const version = apiGroupVersions.find(
      (v) => v.versionId === selectedVersionAId
    )
    return version ? `Version ${version.versionNumber}` : 'Latest'
  }, [selectedVersionAId, apiGroupVersions])

  const versionBName = useMemo(() => {
    if (selectedVersionBId === null) return 'Latest'
    const version = apiGroupVersions.find(
      (v) => v.versionId === selectedVersionBId
    )
    return version ? `Version ${version.versionNumber}` : 'Latest'
  }, [selectedVersionBId, apiGroupVersions])

  const selectedEndpointA = useMemo(() => {
    if (!selectedEndpointKey) return null
    return versionA.allEndpoints.find(
      (e) => getEndpointCompareKey(e) === selectedEndpointKey
    )
  }, [versionA.allEndpoints, selectedEndpointKey])

  const selectedEndpointB = useMemo(() => {
    if (!selectedEndpointKey) return null
    return versionB.allEndpoints.find(
      (e) => getEndpointCompareKey(e) === selectedEndpointKey
    )
  }, [versionB.allEndpoints, selectedEndpointKey])

  return (
    <BetterDialogContent
      title="Compare Versions"
      className="grid h-full grid-cols-2 gap-4 p-4"
      description={
        <span>
          Compare <span className="font-medium">{versionAName}</span> with{' '}
          <span className="font-medium">{versionBName}</span>.
        </span>
      }
    >
      <VersionLayout
        versions={apiGroupVersions}
        currentVersionId={selectedVersionId}
        selectedLeftVersionId={selectedVersionAId}
        setSelectedLeftVersionId={setSelectedVersionAId}
        selectedRightVersionId={selectedVersionBId}
        setSelectedRightVersionId={setSelectedVersionBId}
        leftContent={
          <>
            <h4 className="px-4 pt-3 text-right text-lg font-medium">
              API Endpoints
            </h4>

            <ApiEndpointsList
              allEndpoints={versionA.allEndpoints}
              protocol={protocol}
              loading={versionA.loading}
              onSelect={(item) => {
                const key = getEndpointCompareKey(item)
                const hasVersionB = versionB.allEndpoints.find(
                  (e) => getEndpointCompareKey(e) === key
                )

                if (hasVersionB) {
                  setSelectedEndpointKey(key)
                } else {
                  setSelectedEndpointKey(null)
                  toast.error('Endpoint not found in version B')
                }
              }}
            />
          </>
        }
        rightContent={
          <>
            <h4 className="px-4 pt-3 text-right text-lg font-medium">
              API Endpoints
            </h4>

            <ApiEndpointsList
              allEndpoints={versionB.allEndpoints}
              protocol={protocol}
              loading={versionB.loading}
              onSelect={(item) => {
                const key = getEndpointCompareKey(item)
                const hasVersionA = versionA.allEndpoints.find(
                  (e) => getEndpointCompareKey(e) === key
                )

                if (hasVersionA) {
                  setSelectedEndpointKey(key)
                } else {
                  setSelectedEndpointKey(null)
                  toast.error('Endpoint not found in version A')
                }
              }}
            />
          </>
        }
      />

      <BetterDialogProvider
        open={
          selectedEndpointKey != null &&
          selectedEndpointA != null &&
          selectedEndpointB != null
        }
        onOpenChange={(open) => {
          if (!open) setSelectedEndpointKey(null)
        }}
        className="h-[100%]! [--width:100%]"
      >
        <CompareApiEndpointDetailsModal
          protocol={protocol}
          // @ts-expect-error - TODO: fix this
          endpointA={selectedEndpointA}
          // @ts-expect-error - TODO: fix this
          endpointB={selectedEndpointB}
        />
      </BetterDialogProvider>
    </BetterDialogContent>
  )
}

// Build a stable comparison key for an endpoint using URL + method from component meta.
// This stays the same across versions even though apiEndpointId changes.
function getEndpointCompareKey(item: {
  apiEndpoint?: LegacyApiEndpoint | null
  componentMeta?: LegacyComponentMeta | null
}): string {
  const apiEndpointId = item.apiEndpoint?.apiEndpointId ?? ''
  const fields = arrayNonNullable(item.componentMeta?.componentModalFields)
  if (fields.length === 0) return apiEndpointId
  const flattened = flattenMetaData(fields, fields)

  const urlField = fields.find((field) => field?.label?.toLowerCase() === 'url')
  const methodField = fields.find(
    (field) => field?.label?.toLowerCase() === 'method'
  )

  const url = urlField?.componentFieldId
    ? (flattened[urlField.componentFieldId] as string)
    : ''
  const methodRaw = methodField?.componentFieldId
    ? (flattened[methodField.componentFieldId] as string)
    : ''
  const method = methodRaw.toUpperCase()

  // Fallback to apiEndpointId if we cannot derive URL/method
  if (!url && !method) return apiEndpointId
  return `${method}:${url}`
}

function ApiEndpointsList({
  allEndpoints,
  protocol,
  loading,
  onSelect,
}: {
  allEndpoints: Array<{
    apiEndpoint?: LegacyApiEndpoint | null
    componentMeta?: LegacyComponentMeta | null
  }>
  protocol: string
  loading: boolean
  onSelect: (item: {
    apiEndpoint?: LegacyApiEndpoint | null
    componentMeta?: LegacyComponentMeta | null
  }) => void
}) {
  const isGraphQL = protocol === 'graphql'
  const isGrpc = protocol === 'grpc'

  const apiEndpoints = useMemo(() => {
    return protocol === 'rest'
      ? allEndpoints.filter((item) => item.apiEndpoint && item.componentMeta)
      : []
  }, [allEndpoints, protocol])

  const graphQLOperations = useMemo(() => {
    return isGraphQL
      ? allEndpoints
          .filter((item) => item.apiEndpoint && item.componentMeta)
          .map((item) => ({
            apiEndpoint: item.apiEndpoint!,
            componentMeta: item.componentMeta!,
          }))
      : []
  }, [allEndpoints, isGraphQL])

  const grpcMethods = useMemo(() => {
    return isGrpc
      ? allEndpoints
          .filter((item) => item.apiEndpoint && item.componentMeta)
          .map((item) => ({
            apiEndpoint: item.apiEndpoint!,
            componentMeta: item.componentMeta!,
          }))
      : []
  }, [allEndpoints, isGrpc])

  const groupedGrpcMethods = useMemo(() => {
    if (!isGrpc) return []
    const grouped = new Map<string, typeof grpcMethods>()
    grpcMethods.forEach((methodData) => {
      const fields = arrayNonNullable(
        methodData.componentMeta.componentModalFields
      )
      const flattened = flattenMetaData(fields, fields)
      const packageField = fields.find(
        (field) => field?.label?.toLowerCase() === 'package name'
      )
      const serviceField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'grpc service name' ||
          field?.label?.toLowerCase() === 'service name'
      )

      const packageName = packageField?.componentFieldId
        ? (flattened[packageField.componentFieldId] as string)
        : ''
      const serviceName = serviceField?.componentFieldId
        ? (flattened[serviceField.componentFieldId] as string)
        : ''

      const key = packageName
        ? `${packageName}.${serviceName}`
        : serviceName || 'Unknown'
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(methodData)
    })
    return Array.from(grouped.entries()).map(([key, methods]) => ({
      serviceKey: key,
      methods,
    }))
  }, [grpcMethods, isGrpc])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <SuperCircleLoader />
      </div>
    )
  }

  if (isGraphQL) {
    if (graphQLOperations.length === 0) {
      return (
        <div className="flex h-[400px] items-center justify-center text-center">
          <p className="text-sm text-[#828DA3]">No operations found</p>
        </div>
      )
    }
    return (
      <Table>
        <TableBody>
          {graphQLOperations.map((operation) => (
            <GraphQLOperationRowReadonly
              key={operation.apiEndpoint.apiEndpointId}
              operation={operation}
              componentMeta={operation.componentMeta}
              onSelect={(operation) => {
                console.log(operation)
              }}
            />
          ))}
        </TableBody>
      </Table>
    )
  }

  if (isGrpc) {
    if (groupedGrpcMethods.length === 0) {
      return (
        <div className="flex h-[400px] items-center justify-center text-center">
          <p className="text-sm text-[#828DA3]">No methods found</p>
        </div>
      )
    }
    return (
      <div className="space-y-6">
        {groupedGrpcMethods.map(({ serviceKey, methods }) => (
          <div key={serviceKey} className="space-y-2">
            <h3 className="px-4 text-sm font-semibold text-[#F4F7FC]">
              {serviceKey}
            </h3>
            <Table>
              <TableBody>
                {methods.map((method) => (
                  <GrpcMethodRowReadonly
                    key={method.apiEndpoint.apiEndpointId}
                    method={method}
                    componentMeta={method.componentMeta}
                    onSelect={(method) => {
                      console.log(method)
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    )
  }

  if (apiEndpoints.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-center">
        <p className="text-sm text-[#828DA3]">No endpoints found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableBody>
        {apiEndpoints.map((item) => (
          <ApiEndPointRowReadonly
            key={item.apiEndpoint?.apiEndpointId}
            endpoint={item.apiEndpoint!}
            componentMeta={item.componentMeta!}
            onSelect={() => onSelect(item)}
          />
        ))}
      </TableBody>
    </Table>
  )
}
