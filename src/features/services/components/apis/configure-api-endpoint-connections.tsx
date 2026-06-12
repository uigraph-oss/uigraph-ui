'use client'

import { useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'

import { GT, privateClient } from '@/api'
import { useOrganizationContext } from '@/contexts'
import { GET_PAGE } from '@/features/dashboard-projects/api'
import { GET_PROJECT } from '@/features/dashboard-projects/api/project'
import { GET_FOCAL_POINT_META_BY_COMPONENT_META_ID } from '@/features/image-frame-canvas-sidebar/api/focal-point-meta'

import { SectionLoader } from '@/components/section-loader'
import { arrayNonNullable } from 'daily-code'
import {
  ConnectionSection,
  type ConnectionItem,
  type ConnectionSectionProps,
} from './endpoint-connections-shared'

type ConfigureApiEndpointConnectionsProps = {
  endpoint: GT.ApiEndpoint
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

async function fetchPages(pageIds: string[]) {
  const results = await Promise.all(
    pageIds.map((pageId) =>
      privateClient.query({
        query: GET_PAGE,
        variables: { pageId },
        fetchPolicy: 'cache-first',
      })
    )
  )

  const map = new Map<string, PageMeta>()
  results.forEach((result, idx) => {
    const pageId = pageIds[idx]
    const page = result.data?.v1GetPage?.[0]
    if (!pageId || !page) return

    map.set(pageId, {
      pageName: page.pageName || '',
      imageUrl: page.screenShotFileUrl || undefined,
      projectId: page.projectId || undefined,
    })
  })

  return map
}

async function fetchProjects(projectIds: string[], organizationId: string) {
  const results = await Promise.all(
    projectIds.map((projectId) =>
      privateClient.query({
        query: GET_PROJECT,
        variables: { projectId, organizationId },
        fetchPolicy: 'cache-first',
      })
    )
  )

  const map = new Map<string, string>()
  results.forEach((result, idx) => {
    const projectId = projectIds[idx]
    const project = result.data?.v1GetProject?.[0]
    if (projectId && project?.name) map.set(projectId, project.name)
  })

  return map
}

export function ConfigureApiEndpointConnections({
  endpoint,
  readonly = false,
}: ConfigureApiEndpointConnectionsProps) {
  const { organizationId } = useOrganizationContext()
  const componentMetaId = endpoint.componentMetaId

  // Connections tab is lazy-rendered, so this is effectively lazy-loaded
  const {
    data: focalPointsData,
    loading: focalPointsLoading,
    error: focalPointsError,
    refetch,
  } = useQuery(GET_FOCAL_POINT_META_BY_COMPONENT_META_ID, {
    variables: { componentMetaId: componentMetaId! },
    skip: !componentMetaId,
    fetchPolicy: 'cache-and-network',
  })

  const focalPoints = useMemo(
    () => arrayNonNullable(focalPointsData?.v1GetFocalPointMeta || []),
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
      if (pageIds.length === 0) {
        // Clear only if there is something to clear (prevents re-renders)
        setPageDataMap((prev) => (prev.size ? new Map() : prev))
        setProjectNameMap((prev) => (prev.size ? new Map() : prev))
        return
      }

      const pages = await fetchPages(pageIds)
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
