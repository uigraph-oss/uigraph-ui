import { GET_FOCAL_POINT } from '@/features/dashboard-pages/api'
import { useQuery } from '@apollo/client'
import { useMemo } from 'react'

export function FocalPointName({
  pageId,
  focalPointId,
}: {
  pageId: string
  focalPointId: string
}) {
  const { data } = useQuery(GET_FOCAL_POINT, {
    fetchPolicy: 'cache-first',
    variables: { pageId },
  })

  const focalPoint = useMemo(() => {
    return data?.v1GetFocalPoint?.filter(
      (focalPoint) => focalPoint?.focalPointId === focalPointId
    )
  }, [data?.v1GetFocalPoint, focalPointId])

  const focalPointName = focalPoint?.[0]?.focalPointName
  if (!focalPointName) return null

  return <span className="text-paragraph ml-2 text-xs">({focalPointName})</span>
}
