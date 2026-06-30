'use client'

import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useCurrentOrganization } from '@/store/auth-store'
import { serializeExampleSamples } from '@/utils/api/openapi-display'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { ArrowLeft } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  apiGroupToLegacy,
  apiGroupVersionToLegacy,
  endpointsToLegacyWithMeta,
  type LegacyAPIGroupVersion,
  type LegacyAPIGroupView,
  type LegacyEndpointWithMeta,
} from '../api/api-adapters'
import {
  API_ENDPOINTS,
  CREATE_API_ENDPOINT,
  DELETE_API_ENDPOINT,
  RESTORE_API_GROUP_VERSION,
  SYNC_API_GROUP,
  UPDATE_API_ENDPOINT,
} from '../api/api-endpoints'
import { API_GROUP_AND_VERSIONS } from '../api/api-group-version'

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

    const groupsRes = useQuery(API_GROUP_AND_VERSIONS, {
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
      () => arrayNonNullable(groupsRes.data?.apiGroups).map(apiGroupToLegacy),
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

    // When a release is selected, show that version's immutable snapshot;
    // otherwise show the working copy.
    const endpointVars = {
      ...listVars,
      versionId: selectedVersionId ?? null,
    }

    const endpointsRes = useQuery(API_ENDPOINTS, {
      fetchPolicy: 'cache-first',
      skip: !orgId,
      variables: endpointVars,
    })

    const refetchEndpoints = useCallback(() => {
      return endpointsRes.refetch()
    }, [endpointsRes])

    const refetchGroups = useCallback(() => {
      return groupsRes.refetch()
    }, [groupsRes])

    // Mutations always target the working copy, so refetch the working-copy list.
    const endpointListVars = {
      query: API_ENDPOINTS,
      variables: { ...listVars, versionId: null },
    }

    const [createServiceApiEndpointMut] = useMutation(CREATE_API_ENDPOINT, {
      awaitRefetchQueries: true,
      refetchQueries: [endpointListVars],
    })

    const [updateServiceApiEndpointMut] = useMutation(UPDATE_API_ENDPOINT, {
      awaitRefetchQueries: true,
      refetchQueries: [endpointListVars],
    })

    const [deleteServiceApiEndpointMut] = useMutation(DELETE_API_ENDPOINT, {
      awaitRefetchQueries: true,
      refetchQueries: [endpointListVars],
    })

    const [syncAPIGroupMut] = useMutation(SYNC_API_GROUP, {
      awaitRefetchQueries: true,
      refetchQueries: [
        endpointListVars,
        { query: API_GROUP_AND_VERSIONS, variables: listVars },
      ],
    })

    const [restoreAPIGroupVersionMut] = useMutation(RESTORE_API_GROUP_VERSION, {
      awaitRefetchQueries: true,
      refetchQueries: [
        endpointListVars,
        { query: API_GROUP_AND_VERSIONS, variables: listVars },
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
        function serializeSamples(value?: string | string[] | null) {
          return serializeExampleSamples(value)
        }
        return updateServiceApiEndpointMut({
          variables: {
            orgId: orgId!,
            serviceId,
            apiGroupId,
            id: apiEndpointId,
            input: {
              exampleRequests: serializeSamples(input.exampleRequests),
              exampleResponses: serializeSamples(input.exampleResponses),
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
            specAssetId?: string
            name?: string
            protocol?: string
          }
        }
      }) => {
        const { input } = opts.variables
        if (!input.specAssetId) {
          throw new Error('Spec file is required to publish a version')
        }
        return syncAPIGroupMut({
          variables: {
            orgId: orgId!,
            serviceId,
            input: {
              apiGroupId,
              name: apiGroup?.name ?? input.label ?? 'API Group',
              // Pass the user-supplied label as the version; when empty the
              // backend auto-derives the next "v{N}".
              version: input.label || undefined,
              protocol: apiGroup?.protocol ?? input.protocol ?? 'REST',
              specAssetId: input.specAssetId,
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
        if (!version) {
          throw new Error('Version not found')
        }
        return restoreAPIGroupVersionMut({
          variables: {
            orgId: orgId!,
            serviceId,
            apiGroupId,
            versionId: version.versionId,
          },
        })
      },
      [
        restoreAPIGroupVersionMut,
        orgId,
        serviceId,
        apiGroupId,
        apiGroupVersions,
      ]
    )

    const protocol = useMemo(() => {
      if (apiGroup?.protocol) {
        return apiGroup.protocol.toLowerCase()
      }
      if (
        apiGroup?.graphqlSpecFileIds &&
        apiGroup.graphqlSpecFileIds.length > 0
      )
        return 'graphql'
      if (apiGroup?.grpcSpecFileIds && apiGroup.grpcSpecFileIds.length > 0)
        return 'grpc'
      if (apiGroup?.openApiSpecFileId || apiGroup?.swaggerSpecFileId)
        return 'rest'
      return 'rest'
    }, [apiGroup])

    const _allEndpoints = useMemo((): LegacyEndpointWithMeta[] => {
      const raw = arrayNonNullable(endpointsRes.data?.apiEndpoints).slice()
      raw.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      return endpointsToLegacyWithMeta(raw, orgId!, protocol)
    }, [endpointsRes.data?.apiEndpoints, orgId, protocol])

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
  // No default: an absent releaseId means the working copy and the URL stays
  // clean. Selecting a release writes it; clearing it removes the param.
  const [releaseId, setReleaseId] = useQueryState('releaseId', parseAsString)

  return {
    selectedVersionId:
      !releaseId || releaseId === 'working-copy' ? null : releaseId,
    setSelectedVersionId: (versionId: string | null) => {
      void setReleaseId(versionId)
    },
  }
}
