import { GT, privateClient } from '@/api'
import { SectionLoader } from '@/components/section-loader'
import { useOrganizationContext } from '@/contexts'
import { useMutation } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  DELETE_FOCAL_POINT_META,
  GET_FOCAL_POINT_META,
  UPDATE_FOCAL_POINT_META,
} from '../api/focal-point-meta'
import { FocalPointComponentsSection } from '../components/focal-point-component-group'

type ComponentsSectionProps = {
  focalPoints: GT.FocalPoint[]
}

export function ComponentsSection({ focalPoints }: ComponentsSectionProps) {
  const { organizationId } = useOrganizationContext()

  const [isPointMetaLoading, setIsPointMetaLoading] = useState(false)
  const [pointMetaList, setPointMetaList] = useState<GT.FocalPointMeta[]>([])

  const [updatePointMeta] = useMutation(UPDATE_FOCAL_POINT_META)
  const [deletePointMeta] = useMutation(DELETE_FOCAL_POINT_META)

  useEffect(() => {
    async function fetchPointMetaList() {
      const promises = focalPoints.map(async (focalPoint) => {
        const pointMetaList = await privateClient.query({
          query: GET_FOCAL_POINT_META,
          variables: { focalPointId: focalPoint.focalPointId! },
          fetchPolicy: 'cache-first',
        })

        return pointMetaList
      })

      const pointMetaList = await Promise.all(promises)
      const flatPointMetaList = pointMetaList
        .map((result) => result.data?.v1GetFocalPointMeta)
        .flat()

      setPointMetaList(arrayNonNullable(flatPointMetaList))
    }

    setIsPointMetaLoading(true)
    fetchPointMetaList()
      .catch(() => {
        toast.error('Failed to fetch point meta list')
      })
      .finally(() => {
        setIsPointMetaLoading(false)
      })
  }, [focalPoints])

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
        await deletePointMeta({
          variables: { focalPointMetaId: pointMetaId },
        })

        setPointMetaList((prev) =>
          prev.filter((meta) => meta.focalPointMetaId !== pointMetaId)
        )
      }}
      updatePointMeta={async (pointMetaId, componentId, input) => {
        const pointMeta = pointMetaList.find(
          (meta) => meta.focalPointMetaId === pointMetaId
        )

        if (!pointMeta) {
          throw new Error('Point meta not found')
        }

        const { data } = await updatePointMeta({
          variables: {
            focalPointMetaId: pointMetaId,
            input: {
              ...input,
              componentId,
              organizationId,
              pageId: pointMeta.pageId!,
              focalPointId: pointMeta.focalPointId!,
              componentModalFields: input.componentModalFields,
            },
          },
        })

        if (data?.v1UpdateFocalPointMeta) {
          setPointMetaList((prev) =>
            prev.map((meta) =>
              meta.focalPointMetaId === pointMetaId
                ? data.v1UpdateFocalPointMeta!
                : meta
            )
          )
        }
      }}
    />
  )
}
