'use client'

import { useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'

import { apolloClientGQL } from '@/api/client'
import { FRAME_BY_ID } from '@/features/dashboard-projects/api/frame'
import { MAP } from '@/features/dashboard-projects/api/map'
import {
  FOCAL_POINT_META_BY_COMPONENT_LINK,
  toPointMeta,
} from '@/features/image-frame-canvas-sidebar/api/focal-point-meta'
import { LegacyApiEndpoint } from '@/features/services/api/api-v2-adapters'
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

type PageMeta = {
  pageName: string
  imageUrl?: string
  projectId?: string
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr))
}

async function fetchPages(pageIds: string[], organizationId: string) {
  const results = await Promise.all(
    pageIds.map((pageId) =>
      apolloClientGQL.query({
        query: FRAME_BY_ID,
        variables: { orgId: organizationId, id: pageId },
        fetchPolicy: 'cache-first',
      })
    )
  )

  const map = new Map<string, PageMeta>()
  results.forEach((result, idx) => {
    const pageId = pageIds[idx]
    const page = result.data?.frameById
    if (!pageId || !page) return

    map.set(pageId, {
      pageName: page.name || '',
      imageUrl: page.screenshotImageUrl || undefined,
      projectId: page.mapId || undefined,
    })
  })

  return map
}

async function fetchProjects(projectIds: string[], organizationId: string) {
  const results = await Promise.all(
    projectIds.map((projectId) =>
      apolloClientGQL.query({
        query: MAP,
        variables: { orgId: organizationId, id: projectId },
        fetchPolicy: 'cache-first',
      })
    )
  )

  const map = new Map<string, string>()
  results.forEach((result, idx) => {
    const projectId = projectIds[idx]
    const project = result.data?.map
    if (projectId && project?.name) map.set(projectId, project.name)
  })

  return map
}

export function ConfigureApiEndpointConnections({
  endpoint,
  readonly = false,
}: ConfigureApiEndpointConnectionsProps) {
  const organizationId = useCurrentOrganization()?.id
  const componentLinkId = endpoint.apiEndpointId

  // Connections tab is lazy-rendered, so this is effectively lazy-loaded
  const {
    data: focalPointsData,
    loading: focalPointsLoading,
    error: focalPointsError,
    refetch,
  } = useQuery(FOCAL_POINT_META_BY_COMPONENT_LINK, {
    client: apolloClientGQL,
    variables: {
      orgId: organizationId!,
      componentLinkId: componentLinkId!,
    },
    skip: !componentLinkId || !organizationId,
    fetchPolicy: 'cache-and-network',
  })

  const focalPoints = useMemo(
    () =>
      arrayNonNullable(
        focalPointsData?.focalPointMetaByComponentLink || []
      ).map(toPointMeta),
    [focalPointsData]
  )

  const pageIds = useMemo(() => {
    const ids = focalPoints
      .map((fp) => fp.pageId)
      .filter((id): id is string => Boolean(id))
    return uniq(ids)
  }, [focalPoints])

  const [pageDataMap, setPageDataMap] = useState<Map<string, PageMeta>>(
    () => new Map()
  )
  const [projectNameMap, setProjectNameMap] = useState<Map<string, string>>(
    () => new Map()
  )

  // Fetch pages + projects for the referenced focal points
  useEffect(() => {
    let cancelled = false

    async function run() {
      if (pageIds.length === 0 || !organizationId) {
        // Clear only if there is something to clear (prevents re-renders)
        setPageDataMap((prev) => (prev.size ? new Map() : prev))
        setProjectNameMap((prev) => (prev.size ? new Map() : prev))
        return
      }

      const pages = await fetchPages(pageIds, organizationId)
      if (cancelled) return
      setPageDataMap(pages)

      const projectIds = uniq(
        Array.from(pages.values())
          .map((p) => p.projectId)
          .filter((id): id is string => Boolean(id))
      )

      if (!organizationId || projectIds.length === 0) return

      const projects = await fetchProjects(projectIds, organizationId)
      if (cancelled) return
      setProjectNameMap(projects)
    }

    run().catch((err) => {
      if (!cancelled)
        console.error('[Connections] Error fetching pages/projects:', err)
    })

    return () => {
      cancelled = true
    }
  }, [pageIds, organizationId])

  const focalPointItems = useMemo<ConnectionItem[]>(() => {
    return arrayNonNullable(
      focalPoints.map((fp) => {
        const id = fp.focalPointMetaId
        if (!id) return null

        const pageData = fp.pageId ? pageDataMap.get(fp.pageId) : undefined
        const fallbackName =
          pageData?.pageName ||
          fp.focalPointMetaId ||
          fp.focalPointId ||
          'Unknown'

        const projectName = pageData?.projectId
          ? projectNameMap.get(pageData.projectId)
          : undefined

        const breadcrumb =
          projectName && pageData?.pageName
            ? `${projectName} · ${pageData.pageName}`
            : projectName
              ? projectName
              : pageData?.pageName || undefined

        return {
          id,
          name: pageData?.pageName || fallbackName,
          imageUrl: pageData?.imageUrl,
          breadcrumb,
          pageId: fp.pageId || undefined,
        }
      })
    )
  }, [focalPoints, pageDataMap, projectNameMap])

  function handleItemClick(id: string) {
    const fp = focalPoints.find((x) => x.focalPointMetaId === id)
    if (!fp?.pageId) return
    window.open(
      `/dashboard/frame/${fp.pageId}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (focalPointsLoading) {
    return <SectionLoader label="Loading focal points..." />
  }

  const sections: ConnectionSectionProps[] = [
    {
      type: 'focalPoint',
      title: 'Used in system maps',
      description: 'Subsystems, flows, or views that depend on this endpoint',
      microcopy: 'Links are managed from System Maps.',
      items: focalPointItems,
      error: focalPointsError?.message,
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
