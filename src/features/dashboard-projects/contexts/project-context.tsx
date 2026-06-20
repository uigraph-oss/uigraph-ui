'use client'

import { clientV2 } from '@/api/client'
import { SectionLoader } from '@/components/section-loader'
import { DashboardPageLayout } from '@/features/dashboard/dashboard-layout'
import { DashboardSectionHeader } from '@/features/dashboard/dashboard-section'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  CREATE_FRAME_V2,
  DELETE_FRAME_V2,
  FRAMES_V2,
  MAP_V2,
  UPDATE_FRAME_V2,
} from '../api'

export const [SingleProjectProvider, useSingleProject] = createContext(
  () => {
    const organizationId = useCurrentOrganization()?.id
    const { mapId } = useParams() as { mapId: string }

    const mapQuery = useQuery(MAP_V2, {
      client: clientV2,
      variables: { orgId: organizationId!, id: mapId },
      fetchPolicy: 'cache-and-network',
      skip: !organizationId,
    })

    const framesQuery = useQuery(FRAMES_V2, {
      client: clientV2,
      variables: { orgId: organizationId!, mapId },
      fetchPolicy: 'cache-and-network',
      skip: !organizationId,
    })

    const refetchFrames = [
      { query: FRAMES_V2, variables: { orgId: organizationId!, mapId } },
    ]

    const [createFrame, { loading: isCreatingFrame }] = useMutation(
      CREATE_FRAME_V2,
      {
        client: clientV2,
        awaitRefetchQueries: true,
        refetchQueries: refetchFrames,
      }
    )

    const [deleteFrame, { loading: isFrameDeleting }] = useMutation(
      DELETE_FRAME_V2,
      {
        client: clientV2,
        awaitRefetchQueries: true,
        refetchQueries: refetchFrames,
      }
    )

    const [updateFrame, { loading: isFrameUpdating }] = useMutation(
      UPDATE_FRAME_V2,
      {
        client: clientV2,
        awaitRefetchQueries: true,
        refetchQueries: refetchFrames,
      }
    )

    return {
      loading: mapQuery.loading && !mapQuery.data?.map,
      map: useMemo(() => mapQuery.data?.map ?? null, [mapQuery.data?.map]),
      frames: useMemo(
        () => arrayNonNullable(framesQuery.data?.frames),
        [framesQuery.data?.frames]
      ),

      mapId,

      createFrame,
      deleteFrame,
      updateFrame,

      isCreatingFrame,
      isFrameDeleting,
      isFrameUpdating,
    }
  },
  {
    useChildrenProvider(children, value) {
      if (!value.loading && value.map) return children

      return (
        <DashboardPageLayout
          crumbs={[{ to: '/dashboard/maps', label: 'Maps' }]}
        >
          <DashboardSectionHeader
            title="Frames"
            description="Manage and organize all frames within this map. Create, edit, and collaborate on individual frames."
          />

          {value.loading && <SectionLoader />}

          {!value.loading && !value.map && (
            <div className="flex h-[400px] w-full items-center justify-center">
              <p className="text-gray-500">No map found</p>
            </div>
          )}
        </DashboardPageLayout>
      )
    },
  }
)
