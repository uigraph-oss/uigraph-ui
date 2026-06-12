'use client'

import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CREATE_SERVICE_API_ENDPOINT_MUTATION,
  DELETE_SERVICE_API_ENDPOINT_MUTATION,
  GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY,
  UPDATE_SERVICE_API_ENDPOINT_META_MUTATION,
  UPDATE_SERVICE_API_ENDPOINT_MUTATION,
} from '../api/api-endpoints'
import {
  CREATE_SERVICE_API_GROUP_VERSION_MUTATION,
  GET_SERVICE_API_GROUP_AND_VERSIONS_QUERY,
  RESTORE_SERVICE_API_GROUP_VERSION_MUTATION,
} from '../api/api-group-version'

type ServiceApiEndpointsContextProps = {
  serviceId: string
  serviceApiGroupId: string
}

export const [
  ServiceApiEndpointsContextProvider,
  useServiceApiEndpointsContext,
] = createContext(
  ({ serviceId, serviceApiGroupId }: ServiceApiEndpointsContextProps) => {
    const { selectedVersionId, setSelectedVersionId } = useSelectedVersionId()

    const groupsRes = useQuery(GET_SERVICE_API_GROUP_AND_VERSIONS_QUERY, {
      fetchPolicy: 'cache-first',
      variables: {
        serviceId,
        apiGroupId: serviceApiGroupId,
      },
    })

    const apiGroup = useMemo(() => {
      return groupsRes.data?.v1GetServiceAPIGroups?.find(
        (g) => g?.serviceApiGroupId === serviceApiGroupId
      )
    }, [groupsRes.data?.v1GetServiceAPIGroups, serviceApiGroupId])

    const apiGroups = useMemo(
      () => arrayNonNullable(groupsRes.data?.v1GetServiceAPIGroups),
      [groupsRes.data?.v1GetServiceAPIGroups]
    )

    const apiGroupVersions = useMemo(
      () => arrayNonNullable(groupsRes.data?.v1GetServiceAPIGroupVersions),
      [groupsRes.data?.v1GetServiceAPIGroupVersions]
    )

    const selectedRelease = useMemo(() => {
      if (!selectedVersionId) return null
      return (
        apiGroupVersions.find(
          (version) => version.versionId === selectedVersionId
        ) ?? null
      )
    }, [apiGroupVersions, selectedVersionId])

    const endpointsRes = useQuery(GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY, {
      fetchPolicy: 'cache-first',
      variables: {
        serviceApiGroupId,
        // When a release is selected, fetch endpoints for that version.
        // Otherwise, fetch current endpoints (versionNumber = null).
        versionNumber: selectedRelease?.versionNumber ?? null,
      },
    })

    const [createServiceApiEndpoint] = useMutation(
      CREATE_SERVICE_API_ENDPOINT_MUTATION,
      {
        awaitRefetchQueries: true,
        refetchQueries: [GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY],
      }
    )

    const [updateServiceApiEndpoint] = useMutation(
      UPDATE_SERVICE_API_ENDPOINT_MUTATION,
      {
        awaitRefetchQueries: true,
        refetchQueries: [GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY],
      }
    )

    const [deleteServiceApiEndpoint] = useMutation(
      DELETE_SERVICE_API_ENDPOINT_MUTATION,
      {
        awaitRefetchQueries: true,
        refetchQueries: [GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY],
      }
    )

    const [updateServiceApiEndpointMeta] = useMutation(
      UPDATE_SERVICE_API_ENDPOINT_META_MUTATION,
      {
        awaitRefetchQueries: true,
        refetchQueries: [GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY],
      }
    )

    const [createServiceApiGroupVersion] = useMutation(
      CREATE_SERVICE_API_GROUP_VERSION_MUTATION,
      {
        awaitRefetchQueries: true,
        refetchQueries: [
          GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY,
          GET_SERVICE_API_GROUP_AND_VERSIONS_QUERY,
        ],
      }
    )

    const [restoreServiceApiGroupVersion] = useMutation(
      RESTORE_SERVICE_API_GROUP_VERSION_MUTATION,
      {
        awaitRefetchQueries: true,
        refetchQueries: [
          GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY,
          GET_SERVICE_API_GROUP_AND_VERSIONS_QUERY,
        ],
      }
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

    const _allEndpoints = useMemo(
      () => arrayNonNullable(endpointsRes.data?.v1GetAPIEndpointsWithMeta),
      [endpointsRes.data?.v1GetAPIEndpointsWithMeta]
    )

    const apiEndpoints = useMemo(() => {
      return protocol === 'rest' ? _allEndpoints : []
    }, [_allEndpoints, protocol])

    const graphQLOperations = useMemo(() => {
      return protocol === 'graphql'
        ? _allEndpoints
            .filter((item) => item.apiEndpoint && item.componentMeta)
            .map((item) => ({
              apiEndpoint: item.apiEndpoint!,
              componentMeta: item.componentMeta!,
            }))
        : []
    }, [_allEndpoints, protocol])

    const grpcMethods = useMemo(() => {
      return protocol === 'grpc'
        ? _allEndpoints
            .filter((item) => item.apiEndpoint && item.componentMeta)
            .map((item) => ({
              apiEndpoint: item.apiEndpoint!,
              componentMeta: item.componentMeta!,
            }))
        : []
    }, [_allEndpoints, protocol])

    return {
      serviceId,
      serviceApiGroupId,

      apiGroup: apiGroup!,
      apiGroups,
      apiGroupVersions,
      isLoading:
        groupsRes.loading &&
        (!groupsRes.data?.v1GetServiceAPIGroups ||
          !groupsRes.data?.v1GetServiceAPIGroupVersions),

      apiEndpoints,
      isApiEndpointsLoading:
        endpointsRes.loading && !endpointsRes.data?.v1GetAPIEndpointsWithMeta,

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
