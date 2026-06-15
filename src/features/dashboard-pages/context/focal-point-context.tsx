import { clientV2 } from '@/api-v2/client'
import { FRAME_BY_ID_V2, MAP_V2 } from '@/features/dashboard-projects/api'
import { isPointWithinRect } from '@/features/image-frame-canvas/helpers'
import { useCanvasTarget } from '@/features/image-frame-canvas/hooks/use-canvas-target'
import { useLocalStorage } from '@/hooks/use-localstorage'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CREATE_FOCAL_POINT_V2,
  DELETE_FOCAL_POINT_V2,
  FOCAL_POINTS_V2,
  UPDATE_FOCAL_POINT_V2,
} from '../api/focal-point-v2'
import {
  CREATE_FRAME_GROUP_V2,
  DELETE_FRAME_GROUP_V2,
  FRAME_GROUPS_V2,
  UPDATE_FRAME_GROUP_V2,
} from '../api/frame-group-v2'
import {
  CREATE_FRAME_LINK_V2,
  DELETE_FRAME_LINK_V2,
  FRAME_LINKS_V2,
  UPDATE_FRAME_LINK_V2,
} from '../api/links-v2'
import { FocalPointPreset } from '../types'

export const [FocalPointContextProvider, useFocalPointContext] = createContext(
  () => {
    const { frameId: frameIdParam } = useParams() as { frameId?: string }
    const frameId = String(frameIdParam)
    const canvasTarget = useCanvasTarget()

    const orgId = useCurrentOrganization()?.id

    const frameQuery = useQuery(FRAME_BY_ID_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, id: frameId },
      skip: !orgId || !frameIdParam,
    })

    const frame = frameQuery.data?.frameById ?? null
    const mapId = frame?.mapId ?? ''

    const mapQuery = useQuery(MAP_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, id: mapId },
      skip: !orgId || !mapId,
    })

    const map = mapQuery.data?.map ?? null

    const listVars = { orgId: orgId!, mapId, frameId }
    const listSkip = { skip: !orgId || !mapId }

    const focalPointsQuery = useQuery(FOCAL_POINTS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-and-network',
      variables: listVars,
      ...listSkip,
    })

    const groupsQuery = useQuery(FRAME_GROUPS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-and-network',
      variables: listVars,
      ...listSkip,
    })

    const linksQuery = useQuery(FRAME_LINKS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-and-network',
      variables: listVars,
      ...listSkip,
    })

    const [zoom, setZoom] = useState(100)

    const LOCAL_STORAGE_KEY = `focal-point-preset:${frameId}`
    const [preset, setPreset] = useLocalStorage<FocalPointPreset | null>(
      LOCAL_STORAGE_KEY,
      null
    )

    const [newPoint, setNewPoint] = useState<{
      type: 'focal' | 'link'
      position: { x: number; y: number } | null
    } | null>(null)

    const [drawRectMode, setDrawRectMode] = useState<{
      type: 'group'
      position: { x: number; y: number; width: number; height: number } | null
    } | null>(null)

    const refetchFocalPoints = [{ query: FOCAL_POINTS_V2, variables: listVars }]
    const refetchGroups = [{ query: FRAME_GROUPS_V2, variables: listVars }]
    const refetchLinks = [{ query: FRAME_LINKS_V2, variables: listVars }]

    const mutationBase = { client: clientV2, awaitRefetchQueries: true }

    const [createFocalPointMutation] = useMutation(CREATE_FOCAL_POINT_V2, {
      ...mutationBase,
      refetchQueries: refetchFocalPoints,
    })
    const [updateFocalPointMutation] = useMutation(UPDATE_FOCAL_POINT_V2, {
      ...mutationBase,
      refetchQueries: refetchFocalPoints,
    })
    const [deleteFocalPointMutation] = useMutation(DELETE_FOCAL_POINT_V2, {
      ...mutationBase,
      refetchQueries: refetchFocalPoints,
    })

    const [createFrameGroupMutation] = useMutation(CREATE_FRAME_GROUP_V2, {
      ...mutationBase,
      refetchQueries: refetchGroups,
    })
    const [updateFrameGroupMutation] = useMutation(UPDATE_FRAME_GROUP_V2, {
      ...mutationBase,
      refetchQueries: refetchGroups,
    })
    const [deleteFrameGroupMutation] = useMutation(DELETE_FRAME_GROUP_V2, {
      ...mutationBase,
      refetchQueries: refetchGroups,
    })

    const [createFrameLinkMutation] = useMutation(CREATE_FRAME_LINK_V2, {
      ...mutationBase,
      refetchQueries: refetchLinks,
    })
    const [updateFrameLinkMutation] = useMutation(UPDATE_FRAME_LINK_V2, {
      ...mutationBase,
      refetchQueries: refetchLinks,
    })
    const [deleteFrameLinkMutation] = useMutation(DELETE_FRAME_LINK_V2, {
      ...mutationBase,
      refetchQueries: refetchLinks,
    })

    const focalPoints = useMemo(
      () => arrayNonNullable(focalPointsQuery.data?.focalPoints),
      [focalPointsQuery.data?.focalPoints]
    )
    const frameGroups = useMemo(
      () => arrayNonNullable(groupsQuery.data?.frameGroups),
      [groupsQuery.data?.frameGroups]
    )
    const frameLinks = useMemo(
      () => arrayNonNullable(linksQuery.data?.frameLinks),
      [linksQuery.data?.frameLinks]
    )

    const selectedFocalPoint = useMemo(
      () => focalPoints.find((f) => f.id === canvasTarget.focalPoint),
      [focalPoints, canvasTarget.focalPoint]
    )

    const selectedFrameGroup = useMemo(
      () => frameGroups.find((g) => g.id === canvasTarget.frameGroup),
      [frameGroups, canvasTarget.frameGroup]
    )

    const selectedFrameGroupPoints = useMemo(() => {
      if (!selectedFrameGroup || focalPoints.length === 0) return []

      return focalPoints.filter((f) =>
        isPointWithinRect(
          {
            x: selectedFrameGroup.locationX!,
            y: selectedFrameGroup.locationY!,
            width: selectedFrameGroup.width!,
            height: selectedFrameGroup.height!,
          },
          { x: f.locationX!, y: f.locationY! }
        )
      )
    }, [focalPoints, selectedFrameGroup])

    return {
      zoom,
      setZoom,

      preset,
      setPreset,

      newPoint,
      setNewPoint,

      drawRectMode,
      setDrawRectMode,

      canvasTarget,
      selectedFocalPoint,
      selectedFrameGroup,
      selectedFrameGroupPoints,

      orgId,
      mapId,
      frameId,

      frame,
      frameLoading: !frame && frameQuery.loading,

      map,
      mapLoading: (!frame && frameQuery.loading) || (!map && mapQuery.loading),

      focalPoints,
      frameGroups,
      frameLinks,

      createFocalPoint(input: {
        name: string
        locationX: number
        locationY: number
        visibility?: string
        isActive?: boolean
      }) {
        return createFocalPointMutation({
          variables: { orgId: orgId!, mapId, frameId, input },
        })
      },

      async updateFocalPoint(
        id: string,
        input: {
          name?: string
          locationX?: number
          locationY?: number
          visibility?: string
          isActive?: boolean
        }
      ) {
        await updateFocalPointMutation({
          variables: { orgId: orgId!, mapId, frameId, id, input },
        })
      },

      async deleteFocalPoint(id: string) {
        await deleteFocalPointMutation({
          variables: { orgId: orgId!, mapId, frameId, id },
        })
      },

      createFrameGroup(input: {
        name: string
        description?: string
        locationX: number
        locationY: number
        width: number
        height: number
        order?: number
      }) {
        return createFrameGroupMutation({
          variables: { orgId: orgId!, mapId, frameId, input },
        })
      },

      updateFrameGroup(
        id: string,
        input: {
          name?: string
          description?: string
          locationX?: number
          locationY?: number
          width?: number
          height?: number
          order?: number
        }
      ) {
        return updateFrameGroupMutation({
          variables: { orgId: orgId!, mapId, frameId, id, input },
        })
      },

      deleteFrameGroup(id: string) {
        return deleteFrameGroupMutation({
          variables: { orgId: orgId!, mapId, frameId, id },
        })
      },

      createFrameLink(input: {
        kind: string
        targetFrameId?: string
        targetMapId?: string
        label?: string
        locationX: number
        locationY: number
      }) {
        return createFrameLinkMutation({
          variables: { orgId: orgId!, mapId, frameId, input },
        })
      },

      updateFrameLink(
        id: string,
        input: {
          kind?: string
          targetFrameId?: string
          targetMapId?: string
          label?: string
          locationX?: number
          locationY?: number
        }
      ) {
        return updateFrameLinkMutation({
          variables: { orgId: orgId!, mapId, frameId, id, input },
        })
      },

      deleteFrameLink(id: string) {
        return deleteFrameLinkMutation({
          variables: { orgId: orgId!, mapId, frameId, id },
        })
      },
    }
  }
)
