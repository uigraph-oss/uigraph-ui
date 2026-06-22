import { apolloClientGQL } from '@/api/client'
import { SectionLoader } from '@/components/section-loader'
import { FocalPoint } from '@/features/dashboard-pages/api/focal-point'
import { useCurrentOrganization } from '@/store/auth-store'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  DELETE_FOCAL_POINT_META,
  FOCAL_POINT_META,
  PointMeta,
  toPointMeta,
  UPDATE_FOCAL_POINT_META,
} from '../api/focal-point-meta'
import { FocalPointComponentsSection } from '../components/focal-point-component-group'

type ComponentsSectionProps = {
  focalPoints: FocalPoint[]
  mapId: string
}

export function ComponentsSection({
  focalPoints,
  mapId,
}: ComponentsSectionProps) {
  const orgId = useCurrentOrganization()?.id

  const [isPointMetaLoading, setIsPointMetaLoading] = useState(false)
  const [pointMetaList, setPointMetaList] = useState<PointMeta[]>([])

  useEffect(() => {
    async function fetchPointMetaList() {
      if (!orgId || !mapId) return

      const results = await Promise.all(
        focalPoints.map((focalPoint) =>
          apolloClientGQL.query({
            query: FOCAL_POINT_META,
            variables: {
              orgId,
              mapId,
              frameId: focalPoint.frameId ?? '',
              focalPointId: focalPoint.id,
            },
            fetchPolicy: 'cache-first',
          })
        )
      )

      const flat = results
        .flatMap((result) => result.data?.focalPointMeta ?? [])
        .map(toPointMeta)

      setPointMetaList(flat)
    }

    setIsPointMetaLoading(true)
    fetchPointMetaList()
      .catch(() => {
        toast.error('Failed to fetch point meta list')
      })
      .finally(() => {
        setIsPointMetaLoading(false)
      })
  }, [focalPoints, orgId, mapId])

  if (isPointMetaLoading) {
    return <SectionLoader label="Loading point meta list" />
  }

  return (
    <FocalPointComponentsSection
      showFocalPointName
      disableCreatePointMeta
      pointMetaList={pointMetaList}
      createPointMeta={async () => {
        throw new Error(
          'Not implemented, Do not need to create point meta here'
        )
      }}
      deletePointMeta={async (pointMetaId) => {
        const meta = pointMetaList.find(
          (m) => m.focalPointMetaId === pointMetaId
        )
        if (!meta) throw new Error('Point meta not found')

        await apolloClientGQL.mutate({
          mutation: DELETE_FOCAL_POINT_META,
          variables: {
            orgId: orgId!,
            mapId,
            frameId: meta.pageId ?? '',
            focalPointId: meta.focalPointId ?? '',
            id: pointMetaId,
          },
        })

        setPointMetaList((prev) =>
          prev.filter((m) => m.focalPointMetaId !== pointMetaId)
        )
      }}
      updatePointMeta={async (pointMetaId, componentId, input) => {
        const meta = pointMetaList.find(
          (m) => m.focalPointMetaId === pointMetaId
        )
        if (!meta) throw new Error('Point meta not found')

        const { data } = await apolloClientGQL.mutate({
          mutation: UPDATE_FOCAL_POINT_META,
          variables: {
            orgId: orgId!,
            mapId,
            frameId: meta.pageId ?? '',
            focalPointId: meta.focalPointId ?? '',
            id: pointMetaId,
            input: {
              componentId,
              componentModalFields: input.componentModalFields,
            },
          },
        })

        if (data?.updateFocalPointMeta) {
          setPointMetaList((prev) =>
            prev.map((m) =>
              m.focalPointMetaId === pointMetaId
                ? {
                    ...m,
                    componentModalFields: input.componentModalFields ?? [],
                  }
                : m
            )
          )
        }
      }}
    />
  )
}
