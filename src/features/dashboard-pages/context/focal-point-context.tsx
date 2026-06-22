import { apolloClientGQL } from '@/api/client'
import { FRAME_BY_ID, MAP } from '@/features/dashboard-projects/api'
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
  CREATE_FOCAL_POINT,
  DELETE_FOCAL_POINT,
  FOCAL_POINTS,
  UPDATE_FOCAL_POINT,
} from '../api/focal-point'
import {
  CREATE_FRAME_GROUP,
  DELETE_FRAME_GROUP,
  FRAME_GROUPS,
  UPDATE_FRAME_GROUP,
} from '../api/frame-group'
import {
  CREATE_FRAME_LINK,
  DELETE_FRAME_LINK,
  FRAME_LINKS,
  UPDATE_FRAME_LINK,
} from '../api/links'
import { FocalPointPreset } from '../types'

export const [FocalPointContextProvider, useFocalPointContext] = createContext(
  () => {
    const { frameId: frameIdParam } = useParams() as { frameId?: string }
    const frameId = String(frameIdParam)
    const canvasTarget = useCanvasTarget()

    const orgId = useCurrentOrganization()?.id

    const frameQuery = useQuery(FRAME_BY_ID, {
      client: apolloClientGQL,
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, id: frameId },
      skip: !orgId || !frameIdParam,
    })

    const frame = frameQuery.data?.frameById ?? null
    const mapId = frame?.mapId ?? ''

    const mapQuery = useQuery(MAP, {
      client: apolloClientGQL,
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, id: mapId },
      skip: !orgId || !mapId,
    })

    const map = mapQuery.data?.map ?? null

    const listVars = { orgId: orgId!, mapId, frameId }
    const listSkip = { skip: !orgId || !mapId }

    const focalPointsQuery = useQuery(FOCAL_POINTS, {
      client: apolloClientGQL,
      fetchPolicy: 'cache-and-network',
      variables: listVars,
      ...listSkip,
    })

    const groupsQuery = useQuery(FRAME_GROUPS, {
      client: apolloClientGQL,
      fetchPolicy: 'cache-and-network',
      variables: listVars,
      ...listSkip,
    })

    const linksQuery = useQuery(FRAME_LINKS, {
      client: apolloClientGQL,
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

    const refetchFocalPoints = [{ query: FOCAL_POINTS, variables: listVars }]
    const refetchGroups = [{ query: FRAME_GROUPS, variables: listVars }]
    const refetchLinks = [{ query: FRAME_LINKS, variables: listVars }]

    const mutationBase = { client: apolloClientGQL, awaitRefetchQueries: true }

    const [createFocalPointMutation] = useMutation(CREATE_FOCAL_POINT, {
      ...mutationBase,
      refetchQueries: refetchFocalPoints,
    })
    const [updateFocalPointMutation] = useMutation(UPDATE_FOCAL_POINT, {
      ...mutationBase,
      refetchQueries: refetchFocalPoints,
    })
    const [deleteFocalPointMutation] = useMutation(DELETE_FOCAL_POINT, {
      ...mutationBase,
      refetchQueries: refetchFocalPoints,
    })

    const [createFrameGroupMutation] = useMutation(CREATE_FRAME_GROUP, {
      ...mutationBase,
      refetchQueries: refetchGroups,
    })
    const [updateFrameGroupMutation] = useMutation(UPDATE_FRAME_GROUP, {
      ...mutationBase,
      refetchQueries: refetchGroups,
    })
    const [deleteFrameGroupMutation] = useMutation(DELETE_FRAME_GROUP, {
      ...mutationBase,
      refetchQueries: refetchGroups,
    })

    const [createFrameLinkMutation] = useMutation(CREATE_FRAME_LINK, {
      ...mutationBase,
      refetchQueries: refetchLinks,
    })
    const [updateFrameLinkMutation] = useMutation(UPDATE_FRAME_LINK, {
      ...mutationBase,
      refetchQueries: refetchLinks,
    })
    const [deleteFrameLinkMutation] = useMutation(DELETE_FRAME_LINK, {
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
