import { clientV2 } from '@/api-v2/client'
import { SectionLoader } from '@/components/section-loader'
import { FocalPointV2 } from '@/features/dashboard-pages/api/focal-point-v2'
import { useCurrentOrganization } from '@/store/auth-store'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  DELETE_FOCAL_POINT_META_V2,
  FOCAL_POINT_META_V2,
  PointMeta,
  toPointMeta,
  UPDATE_FOCAL_POINT_META_V2,
} from '../api/focal-point-meta-v2'
import { FocalPointComponentsSection } from '../components/focal-point-component-group'

type ComponentsSectionProps = {
  focalPoints: FocalPointV2[]
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
          clientV2.query({
            query: FOCAL_POINT_META_V2,
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

        await clientV2.mutate({
          mutation: DELETE_FOCAL_POINT_META_V2,
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

        const { data } = await clientV2.mutate({
          mutation: UPDATE_FOCAL_POINT_META_V2,
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
