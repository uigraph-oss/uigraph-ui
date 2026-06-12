'use client'

import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'
import {
  GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY,
  GET_SERVICE_API_GROUPS_QUERY,
} from '../api/api-endpoints'
import {
  deriveApiOperations,
  getProtocolFromApiGroup,
  type ApiOperationOption,
} from '../utils/derive-api-operations'

export type ApiGroupForTestCase = {
  serviceApiGroupId: string
  version: string | null
  protocol: string | null
}

export function useServiceApiOperationsForTestCase(serviceId: string | null) {
  const [selectedApiGroupId, setSelectedApiGroupId] = useState<string | null>(
    null
  )

  const { data: groupsData, loading: groupsLoading } = useQuery(
    GET_SERVICE_API_GROUPS_QUERY,
    {
      variables: { serviceId: serviceId! },
      skip: !serviceId,
      fetchPolicy: 'cache-first',
    }
  )

  const apiGroups = useMemo((): ApiGroupForTestCase[] => {
    const raw = arrayNonNullable(groupsData?.v1GetServiceAPIGroups)
    return raw.map((g) => ({
      serviceApiGroupId: g.serviceApiGroupId ?? '',
      version: g.version ?? null,
      protocol: g.protocol ?? null,
    }))
  }, [groupsData?.v1GetServiceAPIGroups])

  const { data: endpointsData, loading: endpointsLoading } = useQuery(
    GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY,
    {
      variables: { serviceApiGroupId: selectedApiGroupId! },
      skip: !selectedApiGroupId,
      fetchPolicy: 'cache-first',
    }
  )

  const endpointsWithMeta = useMemo(
    () => arrayNonNullable(endpointsData?.v1GetAPIEndpointsWithMeta),
    [endpointsData?.v1GetAPIEndpointsWithMeta]
  )

  const selectedGroupRaw = useMemo(
    () =>
      groupsData?.v1GetServiceAPIGroups?.find(
        (g) => g?.serviceApiGroupId === selectedApiGroupId
      ) ?? null,
    [groupsData?.v1GetServiceAPIGroups, selectedApiGroupId]
  )

  const protocol = useMemo(
    () =>
      selectedGroupRaw ? getProtocolFromApiGroup(selectedGroupRaw) : 'rest',
    [selectedGroupRaw]
  )

  const operations = useMemo((): ApiOperationOption[] => {
    if (!selectedApiGroupId || endpointsWithMeta.length === 0) return []
    return deriveApiOperations(protocol, endpointsWithMeta)
  }, [selectedApiGroupId, protocol, endpointsWithMeta])

  const loading = groupsLoading || (!!selectedApiGroupId && endpointsLoading)

  return {
    apiGroups,
    selectedApiGroupId,
    setSelectedApiGroupId,
    operations,
    loading,
    protocol,
  }
}
