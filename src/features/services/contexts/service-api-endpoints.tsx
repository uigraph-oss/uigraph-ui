'use client'

import { clientV2 } from '@/api-v2/client'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  API_ENDPOINTS_V2,
  CREATE_API_ENDPOINT_V2,
  DELETE_API_ENDPOINT_V2,
  SYNC_API_GROUP_V2,
  UPDATE_API_ENDPOINT_V2,
} from '../api/api-endpoints-v2'
import { API_GROUP_AND_VERSIONS_V2 } from '../api/api-group-version-v2'
import {
  apiGroupToLegacy,
  apiGroupVersionToLegacy,
  endpointsToLegacyWithMeta,
  type LegacyAPIGroupView,
  type LegacyAPIGroupVersion,
  type LegacyEndpointWithMeta,
} from '../api/api-v2-adapters'

type ServiceApiEndpointsContextProps = {
  serviceId: string
  serviceApiGroupId: string
}

function fieldsToEndpointInput(
  fields: Array<{ label?: string | null; data?: string | null }>
) {
  const byLabel = new Map(
    fields.map((f) => [(f.label ?? '').toLowerCase(), f.data ?? ''])
  )
  return {
    method: byLabel.get('method') || undefined,
    path: byLabel.get('url') || byLabel.get('path') || undefined,
    summary: byLabel.get('summary') || undefined,
    description: byLabel.get('description') || undefined,
    requestBody: byLabel.get('request schema') || undefined,
    responses: byLabel.get('response schema') || undefined,
    parameters: byLabel.get('parameters') || undefined,
  }
}

export const [
  ServiceApiEndpointsContextProvider,
  useServiceApiEndpointsContext,
] = createContext(
  ({ serviceId, serviceApiGroupId }: ServiceApiEndpointsContextProps) => {
    const orgId = useCurrentOrganization().id
    const apiGroupId = serviceApiGroupId
    const { selectedVersionId, setSelectedVersionId } = useSelectedVersionId()

    const listVars = {
      orgId: orgId!,
      serviceId,
      apiGroupId,
    }

    const groupsRes = useQuery(API_GROUP_AND_VERSIONS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      skip: !orgId,
      variables: listVars,
    })

    const apiGroupRaw = useMemo(() => {
      return groupsRes.data?.apiGroups?.find((g) => g.id === apiGroupId)
    }, [groupsRes.data?.apiGroups, apiGroupId])

    const apiGroup = useMemo((): LegacyAPIGroupView | undefined => {
      if (!apiGroupRaw) return undefined
      return apiGroupToLegacy(apiGroupRaw)
    }, [apiGroupRaw])

    const apiGroups = useMemo(
      () =>
        arrayNonNullable(groupsRes.data?.apiGroups).map(apiGroupToLegacy),
      [groupsRes.data?.apiGroups]
    )

    const apiGroupVersions = useMemo((): LegacyAPIGroupVersion[] => {
      return arrayNonNullable(groupsRes.data?.apiGroupVersions).map(
        apiGroupVersionToLegacy
      )
    }, [groupsRes.data?.apiGroupVersions])

    const selectedRelease = useMemo(() => {
      if (!selectedVersionId) return null
      return (
        apiGroupVersions.find(
          (version) => version.versionId === selectedVersionId
        ) ?? null
      )
    }, [apiGroupVersions, selectedVersionId])

    const endpointsRes = useQuery(API_ENDPOINTS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      skip: !orgId,
      variables: listVars,
    })

    const refetchEndpoints = useCallback(() => {
      return endpointsRes.refetch()
    }, [endpointsRes])

    const refetchGroups = useCallback(() => {
      return groupsRes.refetch()
    }, [groupsRes])

    const endpointListVars = {
      query: API_ENDPOINTS_V2,
      variables: listVars,
    }

    const [createServiceApiEndpointMut] = useMutation(CREATE_API_ENDPOINT_V2, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries: [endpointListVars],
    })

    const [updateServiceApiEndpointMut] = useMutation(UPDATE_API_ENDPOINT_V2, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries: [endpointListVars],
    })

    const [deleteServiceApiEndpointMut] = useMutation(DELETE_API_ENDPOINT_V2, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries: [endpointListVars],
    })

    const [syncAPIGroupMut] = useMutation(SYNC_API_GROUP_V2, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries: [
        endpointListVars,
        { query: API_GROUP_AND_VERSIONS_V2, variables: listVars },
      ],
    })

    const createServiceApiEndpoint = useCallback(
      (opts: {
        variables: {
          input: {
            serviceApiGroupId?: string
            method?: string
            path?: string
            summary?: string
            description?: string
            order?: number
          }
        }
      }) => {
        const { input } = opts.variables
        return createServiceApiEndpointMut({
          variables: {
            orgId: orgId!,
            serviceId,
            apiGroupId,
            input: {
              method: input.method ?? 'GET',
              path: input.path ?? '/',
              summary: input.summary,
              description: input.description,
              order: input.order,
            },
          },
        })
      },
      [createServiceApiEndpointMut, orgId, serviceId, apiGroupId]
    )

    const updateServiceApiEndpoint = useCallback(
      (opts: {
        variables: {
          apiEndpointId: string
          input: {
            exampleRequests?: string | string[] | null
            exampleResponses?: string | string[] | null
            order?: number | null
            serviceApiGroupId?: string | null
            componentMetaId?: string | null
          }
        }
      }) => {
        const { apiEndpointId, input } = opts.variables
        const serializeSamples = (value?: string | string[] | null) => {
          if (value == null) return undefined
          return Array.isArray(value) ? JSON.stringify(value) : value
        }
        return updateServiceApiEndpointMut({
          variables: {
            orgId: orgId!,
            serviceId,
            apiGroupId,
            id: apiEndpointId,
            input: {
              requestBody: serializeSamples(input.exampleRequests),
              responses: serializeSamples(input.exampleResponses),
              order: input.order ?? undefined,
            },
          },
        })
      },
      [updateServiceApiEndpointMut, orgId, serviceId, apiGroupId]
    )

    const deleteServiceApiEndpoint = useCallback(
      (opts: {
        variables: { organizationId?: string; apiEndpointId: string }
      }) => {
        return deleteServiceApiEndpointMut({
          variables: {
            orgId: orgId!,
            serviceId,
            apiGroupId,
            id: opts.variables.apiEndpointId,
          },
        })
      },
      [deleteServiceApiEndpointMut, orgId, serviceId, apiGroupId]
    )

    const updateServiceApiEndpointMeta = useCallback(
      (opts: {
        variables: {
          componentMetaId: string
          input: {
            componentModalFields?: Array<{
              label?: string | null
              data?: string | null
            }>
          }
        }
      }) => {
        const fields = opts.variables.input.componentModalFields ?? []
        return updateServiceApiEndpointMut({
          variables: {
            orgId: orgId!,
            serviceId,
            apiGroupId,
            id: opts.variables.componentMetaId,
            input: fieldsToEndpointInput(fields),
          },
        })
      },
      [updateServiceApiEndpointMut, orgId, serviceId, apiGroupId]
    )

    const createServiceApiGroupVersion = useCallback(
      async (opts: {
        variables: {
          apiGroupId: string
          input: {
            label?: string
            openApiSpecFileId?: string
            spec?: string
            name?: string
            protocol?: string
          }
        }
      }) => {
        const { input } = opts.variables
        const spec = input.spec
        if (!spec) {
          throw new Error('Spec content is required to publish a version')
        }
        return syncAPIGroupMut({
          variables: {
            orgId: orgId!,
            serviceId,
            input: {
              apiGroupId,
              name: apiGroup?.name ?? input.label ?? 'API Group',
              version: apiGroup?.version ?? 'v1',
              protocol: apiGroup?.protocol ?? input.protocol ?? 'REST',
              spec,
            },
          },
        })
      },
      [syncAPIGroupMut, orgId, serviceId, apiGroupId, apiGroup]
    )

    const restoreServiceApiGroupVersion = useCallback(
      async (opts: {
        variables: { apiGroupId: string; versionNumber: number }
      }) => {
        const version = apiGroupVersions.find(
          (v) => v.versionNumber === opts.variables.versionNumber
        )
        if (!version || !apiGroupRaw) {
          throw new Error('Version not found')
        }
        const specRes = await fetch(
          `/api/v1/storage/${encodeURIComponent(version.versionId)}`,
          { credentials: 'include' }
        ).catch(() => null)
        let spec = ''
        if (specRes?.ok) {
          spec = await specRes.text()
        }
        if (!spec) {
          throw new Error('Could not load version spec for restore')
        }
        return syncAPIGroupMut({
          variables: {
            orgId: orgId!,
            serviceId,
            input: {
              apiGroupId,
              name: apiGroupRaw.name,
              version: apiGroupRaw.version,
              protocol: apiGroupRaw.protocol,
              spec,
            },
          },
        })
      },
      [
        syncAPIGroupMut,
        orgId,
        serviceId,
        apiGroupId,
        apiGroupVersions,
        apiGroupRaw,
      ]
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

    const _allEndpoints = useMemo((): LegacyEndpointWithMeta[] => {
      const raw = arrayNonNullable(endpointsRes.data?.apiEndpoints)
      return endpointsToLegacyWithMeta(raw, orgId!)
    }, [endpointsRes.data?.apiEndpoints, orgId])

    const apiEndpoints = useMemo(() => {
      return protocol === 'rest' ? _allEndpoints : []
    }, [_allEndpoints, protocol])

    const graphQLOperations = useMemo(() => {
      return protocol === 'graphql'
        ? _allEndpoints.filter((item) => item.apiEndpoint && item.componentMeta)
        : []
    }, [_allEndpoints, protocol])

    const grpcMethods = useMemo(() => {
      return protocol === 'grpc'
        ? _allEndpoints.filter((item) => item.apiEndpoint && item.componentMeta)
        : []
    }, [_allEndpoints, protocol])

    return {
      orgId,
      serviceId,
      serviceApiGroupId: apiGroupId,

      apiGroup: apiGroup!,
      apiGroups,
      apiGroupVersions,
      isLoading:
        groupsRes.loading &&
        (!groupsRes.data?.apiGroups || !groupsRes.data?.apiGroupVersions),

      apiEndpoints,
      isApiEndpointsLoading:
        endpointsRes.loading && !endpointsRes.data?.apiEndpoints,

      protocol,
      grpcMethods,
      graphQLOperations,
      isGrpcLoading: endpointsRes.loading && protocol === 'grpc',
      isGraphQLLoading: endpointsRes.loading && protocol === 'graphql',

      createServiceApiEndpoint,
      updateServiceApiEndpoint,
      deleteServiceApiEndpoint,
      updateServiceApiEndpointMeta,
      createServiceApiGroupVersion,
      restoreServiceApiGroupVersion,

      refetchEndpoints,
      refetchGroups,

      selectedVersionId,
      setSelectedVersionId,
      selectedReleaseId: selectedVersionId,
      setSelectedReleaseId: setSelectedVersionId,
      selectedRelease,
    }
  },

  {
    useChildrenProvider(children, value) {
      const navigate = useNavigate()

      const isLoading = value.isLoading
      const isNotFound = !isLoading && !value.apiGroup

      if (isLoading || isNotFound) {
        return (
          <div className="flex h-full flex-col">
            <DashboardSectionHeader
              title="API Group"
              description="Manage API endpoints, business logic, request/response samples, and test cases."
            >
              <Button
                preset="outline"
                onClick={() => navigate(`/services/${value.serviceId}/apis`)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to APIs
              </Button>
            </DashboardSectionHeader>

            <DashboardSectionContent noPadding>
              {isLoading && <SectionLoader label="Loading API version..." />}
              {isNotFound && (
                <SectionNotFound plain label="API version not found" />
              )}
            </DashboardSectionContent>
          </div>
        )
      }

      return children
    },
  }
)

function useSelectedVersionId() {
  const [searchParams, setSearchParams] = useSearchParamsState(
    'releaseId',
    'version'
  )

  return {
    selectedVersionId:
      searchParams.releaseId === 'working-copy'
        ? null
        : (searchParams.releaseId ?? searchParams.version),
    setSelectedVersionId: (versionId: string | null) => {
      void setSearchParams(
        {
          releaseId: versionId ?? 'working-copy',
          version: null,
        },
        true
      )
    },
  }
}