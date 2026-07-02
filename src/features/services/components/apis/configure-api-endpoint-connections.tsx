'use client'

import { useQuery } from '@apollo/client'
import { useMemo } from 'react'

import { COMPONENT_LINK_USAGES } from '@/features/image-frame-canvas-sidebar/api/focal-point-meta'
import { LegacyApiEndpoint } from '@/features/services/api/api-adapters'
import { useCurrentOrganization } from '@/store/auth-store'

import { SectionLoader } from '@/components/section-loader'
import { arrayNonNullable } from 'daily-code'
import {
  ConnectionSection,
  type ConnectionItem,
  type ConnectionSectionProps,
} from './endpoint-connections-shared'

type ConfigureApiEndpointConnectionsProps = {
  endpoint: LegacyApiEndpoint
  readonly?: boolean
}

export function ConfigureApiEndpointConnections({
  endpoint,
  readonly = false,
}: ConfigureApiEndpointConnectionsProps) {
  const organizationId = useCurrentOrganization()?.id
  const apiEndpointId = endpoint.apiEndpointId

  // Connections tab is lazy-rendered, so this is effectively lazy-loaded.
  // The backend joins meta → focal point → frame → map, so a single query
  // returns the map, screen, and focal point for each usage.
  const { data, loading, error, refetch } = useQuery(COMPONENT_LINK_USAGES, {
    variables: {
      orgId: organizationId!,
      linkId: apiEndpointId!,
    },
    skip: !apiEndpointId || !organizationId,
    fetchPolicy: 'cache-and-network',
  })

  const usages = useMemo(
    () => arrayNonNullable(data?.componentLinkUsages || []),
    [data]
  )

  const usageItems = useMemo<ConnectionItem[]>(() => {
    return usages.map((usage) => ({
      id: usage.metaId,
      name: usage.mapName || usage.frameName || 'Untitled map',
      imageUrl: usage.screenshotImageUrl || undefined,
      screenName: usage.frameName || undefined,
      focalPointName: usage.focalPointName || undefined,
      pageId: usage.frameId,
    }))
  }, [usages])

  function handleItemClick(id: string) {
    const usage = usages.find((u) => u.metaId === id)
    if (!usage?.frameId) return
    // Deep-link straight to the focal point on the frame (?point=<id>),
    // matching how the canvas selects a target.
    const url = usage.focalPointId
      ? `/dashboard/frame/${usage.frameId}?point=${usage.focalPointId}`
      : `/dashboard/frame/${usage.frameId}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading && usages.length === 0) {
    return <SectionLoader label="Loading connections..." />
  }

  const sections: ConnectionSectionProps[] = [
    {
      type: 'focalPoint',
      title: 'Used in system maps',
      description: 'Subsystems, flows, or views that depend on this endpoint',
      microcopy: 'Links are managed from System Maps.',
      items: usageItems,
      error: error?.message,
      onItemClick: handleItemClick,
      onRetry: refetch,
    },
  ]

  return (
    <div>
      {sections.map((section) => (
        <ConnectionSection
          key={section.type}
          {...section}
          readonly={readonly}
        />
      ))}
    </div>
  )
}
