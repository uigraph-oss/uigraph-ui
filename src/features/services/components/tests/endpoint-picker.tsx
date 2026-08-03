'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'
import { API_ENDPOINTS, API_GROUPS } from '../../api/api-endpoints'
import { useServiceContext } from '../../contexts/service-context'

export type PickedEndpoint = {
  id: string
  method: string
  path: string
  summary: string
}

type EndpointPickerProps = {
  onSelect: (endpoint: PickedEndpoint) => void
}

/**
 * Two-step (API group → endpoint) picker sourced from the service's real
 * API catalog, mirroring the same picker used by the API test-case form —
 * so "target endpoints" always reference real, existing endpoints rather
 * than free text.
 *
 * Picking an endpoint adds it immediately (no separate "Add" click) —
 * an earlier version required a second, unlabeled step after the picks
 * that had no visual confirmation, so a selected endpoint could silently
 * never make it into the run.
 */
export function EndpointPicker({ onSelect }: EndpointPickerProps) {
  const orgId = useCurrentOrganization().id
  const { serviceId } = useServiceContext()

  const [selectedGroupId, setSelectedGroupId] = useState('')

  const { data: groupsData, loading: isGroupsLoading } = useQuery(API_GROUPS, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId!, serviceId },
    skip: !orgId || !serviceId,
  })
  const apiGroups = useMemo(
    () => arrayNonNullable(groupsData?.apiGroups),
    [groupsData?.apiGroups]
  )

  const { data: endpointsData, loading: isEndpointsLoading } = useQuery(
    API_ENDPOINTS,
    {
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, serviceId, apiGroupId: selectedGroupId },
      skip: !orgId || !serviceId || !selectedGroupId,
    }
  )
  const apiEndpoints = useMemo(
    () => arrayNonNullable(endpointsData?.apiEndpoints),
    [endpointsData?.apiEndpoints]
  )

  function handleSelectEndpoint(endpointId: string) {
    const endpoint = apiEndpoints.find((e) => e.id === endpointId)
    if (!endpoint) return
    onSelect({
      id: endpoint.id,
      method: endpoint.method,
      path: endpoint.path,
      summary: endpoint.summary,
    })
  }

  return (
    <div className="flex gap-2">
      <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue
            placeholder={isGroupsLoading ? 'Loading…' : 'Select API group'}
          />
        </SelectTrigger>
        <SelectContent>
          {apiGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.label || group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value=""
        onValueChange={handleSelectEndpoint}
        disabled={!selectedGroupId}
      >
        <SelectTrigger className="h-9 flex-1">
          <SelectValue
            placeholder={
              !selectedGroupId
                ? 'Select a group first'
                : isEndpointsLoading
                  ? 'Loading…'
                  : 'Select endpoint to add'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {apiEndpoints.map((endpoint) => (
            <SelectItem key={endpoint.id} value={endpoint.id}>
              {endpoint.method} {endpoint.path}
              {endpoint.summary ? ` — ${endpoint.summary}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
