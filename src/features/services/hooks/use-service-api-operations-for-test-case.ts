'use client'

import { clientV2 } from '@/api-v2/client'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'
import {
  API_ENDPOINTS_V2,
  API_GROUPS_V2,
} from '../api/api-endpoints-v2'
import { endpointsToLegacyWithMeta } from '../api/api-v2-adapters'
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
  const orgId = useCurrentOrganization().id
  const [selectedApiGroupId, setSelectedApiGroupId] = useState<string | null>(
    null
  )

  const { data: groupsData, loading: groupsLoading } = useQuery(
    API_GROUPS_V2,
    {
      client: clientV2,
      variables: { orgId: orgId!, serviceId: serviceId! },
      skip: !orgId || !serviceId,
      fetchPolicy: 'cache-first',
    }
  )

  const apiGroups = useMemo((): ApiGroupForTestCase[] => {
    const raw = arrayNonNullable(groupsData?.apiGroups)
    return raw.map((g) => ({
      serviceApiGroupId: g.id,
      version: g.version ?? null,
      protocol: g.protocol ?? null,
    }))
  }, [groupsData?.apiGroups])

  const { data: endpointsData, loading: endpointsLoading } = useQuery(
    API_ENDPOINTS_V2,
    {
      client: clientV2,
      variables: {
        orgId: orgId!,
        serviceId: serviceId!,
        apiGroupId: selectedApiGroupId!,
      },
      skip: !orgId || !serviceId || !selectedApiGroupId,
      fetchPolicy: 'cache-first',
    }
  )

  const endpointsWithMeta = useMemo(
    () =>
      endpointsToLegacyWithMeta(
        arrayNonNullable(endpointsData?.apiEndpoints),
        orgId!
      ),
    [endpointsData?.apiEndpoints, orgId]
  )

  const selectedGroupRaw = useMemo(
    () =>
      groupsData?.apiGroups?.find((g) => g.id === selectedApiGroupId) ?? null,
    [groupsData?.apiGroups, selectedApiGroupId]
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
