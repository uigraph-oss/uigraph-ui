import { clientV2 } from '@/api/client'
import { FOCAL_POINTS_V2 } from '@/features/dashboard-pages/api/focal-point-v2'
import { FRAME_BY_ID_V2 } from '@/features/dashboard-projects/api'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useMemo } from 'react'

export function FocalPointName({
  pageId,
  focalPointId,
}: {
  pageId: string
  focalPointId: string
}) {
  const orgId = useCurrentOrganization()?.id

  const frameQuery = useQuery(FRAME_BY_ID_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId!, id: pageId },
    skip: !orgId || !pageId,
  })

  const mapId = frameQuery.data?.frameById?.mapId ?? ''

  const { data } = useQuery(FOCAL_POINTS_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId!, mapId, frameId: pageId },
    skip: !orgId || !mapId || !pageId,
  })

  const focalPointName = useMemo(
    () => data?.focalPoints?.find((f) => f?.id === focalPointId)?.name,
    [data?.focalPoints, focalPointId]
  )

  if (!focalPointName) return null

  return <span className="text-paragraph ml-2 text-xs">({focalPointName})</span>
}
