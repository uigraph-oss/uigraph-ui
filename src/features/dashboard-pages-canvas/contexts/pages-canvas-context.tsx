import { apolloClientGQL } from '@/api/client'
import { SectionLoader } from '@/components/section-loader'
import { CANVAS, UPSERT_CANVAS } from '@/features/dashboard-pages/api/canvas'
import {
  DELETE_FOCAL_POINT,
  FOCAL_POINTS,
  FocalPointV2,
  UPDATE_FOCAL_POINT,
} from '@/features/dashboard-pages/api/focal-point'
import {
  DELETE_FRAME_GROUP,
  FRAME_GROUPS,
  FrameGroupV2,
  UPDATE_FRAME_GROUP,
} from '@/features/dashboard-pages/api/frame-group'
import { FRAME_LINKS, FrameLinkV2 } from '@/features/dashboard-pages/api/links'
import { DashboardFrame, DashboardMap } from '@/features/dashboard-projects/api'
import { isPointWithinRect } from '@/features/image-frame-canvas/helpers'
import { useCanvasTarget } from '@/features/image-frame-canvas/hooks/use-canvas-target'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { createContext } from 'daily-code/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type PagesCanvasContextInput = {
  pages: DashboardFrame[]
  project: DashboardMap
}

type CanvasItem = { pageId: string; position: { x: number; y: number } }

export const [PagesCanvasContextProvider, usePagesCanvasContext] =
  createContext(
    ({ pages, project }: PagesCanvasContextInput) => {
      const canvasTarget = useCanvasTarget()
      const [zoom, setZoom] = useState(0)

      const orgId = useCurrentOrganization()?.id
      const mapId = project.id

      const canvasRes = useQuery(CANVAS, {
        client: apolloClientGQL,
        variables: { orgId: orgId!, mapId },
        skip: !orgId || !mapId,
      })

      const [upsertCanvas, upsertCanvasRes] = useMutation(UPSERT_CANVAS, {
        client: apolloClientGQL,
        awaitRefetchQueries: true,
        refetchQueries: [
          { query: CANVAS, variables: { orgId: orgId!, mapId } },
        ],
      })

      const [focalPoints, setFocalPoints] = useState<FocalPointV2[]>([])
      const [frameGroups, setFrameGroups] = useState<FrameGroupV2[]>([])
      const [pageLinks, setPageLinks] = useState<FrameLinkV2[]>([])
      const [projectLinks, setProjectLinks] = useState<FrameLinkV2[]>([])

      const loadCanvasPoints = useCallback(async () => {
        if (!orgId || !mapId) return

        const results = await Promise.all(
          pages.map((frame) =>
            Promise.all([
              apolloClientGQL.query({
                query: FOCAL_POINTS,
                variables: { orgId, mapId, frameId: frame.id },
                fetchPolicy: 'network-only',
              }),
              apolloClientGQL.query({
                query: FRAME_GROUPS,
                variables: { orgId, mapId, frameId: frame.id },
                fetchPolicy: 'network-only',
              }),
              apolloClientGQL.query({
                query: FRAME_LINKS,
                variables: { orgId, mapId, frameId: frame.id },
                fetchPolicy: 'network-only',
              }),
            ])
          )
        )

        const allFocalPoints = results.flatMap(
          ([fp]) => fp.data?.focalPoints ?? []
        )
        const allGroups = results.flatMap(([, g]) => g.data?.frameGroups ?? [])
        const allLinks = results.flatMap(([, , l]) => l.data?.frameLinks ?? [])

        setFocalPoints(allFocalPoints)
        setFrameGroups(allGroups)
        setPageLinks(allLinks.filter((l) => l.kind === 'frame'))
        setProjectLinks(allLinks.filter((l) => l.kind === 'map'))
      }, [pages, orgId, mapId])

      useEffect(() => {
        loadCanvasPoints().catch(console.error)
      }, [loadCanvasPoints])

      const pageCanvasItems = useMemo<CanvasItem[]>(() => {
        const raw = canvasRes.data?.canvas?.framePositions
        if (!raw) return []
        try {
          const parsed = JSON.parse(raw) as Record<
            string,
            { x: number; y: number }
          >
          return Object.entries(parsed).map(([pageId, position]) => ({
            pageId,
            position,
          }))
        } catch {
          return []
        }
      }, [canvasRes.data?.canvas?.framePositions])

      const selectedFocalPointId = canvasTarget.focalPoint
      const selectedFocalPoint = useMemo(
        () => focalPoints.find((f) => f.id === selectedFocalPointId),
        [focalPoints, selectedFocalPointId]
      )

      const selectedFrameGroupId = canvasTarget.frameGroup
      const selectedFrameGroup = useMemo(
        () => frameGroups.find((g) => g.id === selectedFrameGroupId),
        [frameGroups, selectedFrameGroupId]
      )

      const [updateFocalPointMutation, updateFocalPointRes] = useMutation(
        UPDATE_FOCAL_POINT,
        { client: apolloClientGQL }
      )
      const [deleteFocalPointMutation, deleteFocalPointRes] = useMutation(
        DELETE_FOCAL_POINT,
        { client: apolloClientGQL }
      )
      const [updateFrameGroupMutation, updateFrameGroupRes] = useMutation(
        UPDATE_FRAME_GROUP,
        { client: apolloClientGQL }
      )
      const [deleteFrameGroupMutation, deleteFrameGroupRes] = useMutation(
        DELETE_FRAME_GROUP,
        { client: apolloClientGQL }
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

        isCreatePageCanvasLoading: upsertCanvasRes.loading,
        async createPageCanvas(zoomValue: number, items: CanvasItem[]) {
          const framePositions = Object.fromEntries(
            items.map((i) => [i.pageId, i.position])
          )
          return upsertCanvas({
            variables: {
              orgId: orgId!,
              mapId,
              input: {
                zoom: zoomValue,
                framePositions: JSON.stringify(framePositions),
              },
            },
          })
        },

        isPageCanvasLoading: canvasRes.loading,
        pageCanvasZoom: canvasRes.data?.canvas?.zoom,
        pageCanvasItems,

        pages,
        project,

        canvasTarget,

        focalPoints,
        pageLinks,
        frameGroups,
        projectLinks,

        selectedFocalPoint,
        selectedFrameGroup,
        selectedFrameGroupPoints,

        isUpdateFocalPointLoading: updateFocalPointRes.loading,
        async updateFocalPoint(
          focalPointId: string,
          input: { name?: string; locationX?: number; locationY?: number }
        ) {
          const fp = focalPoints.find((f) => f.id === focalPointId)
          await updateFocalPointMutation({
            variables: {
              orgId: orgId!,
              mapId,
              frameId: fp?.frameId ?? '',
              id: focalPointId,
              input,
            },
          })
          await loadCanvasPoints()
        },

        isDeleteFocalPointLoading: deleteFocalPointRes.loading,
        async deleteFocalPoint(focalPointId: string) {
          const fp = focalPoints.find((f) => f.id === focalPointId)
          await deleteFocalPointMutation({
            variables: {
              orgId: orgId!,
              mapId,
              frameId: fp?.frameId ?? '',
              id: focalPointId,
            },
          })
          await loadCanvasPoints()
        },

        isUpdateFrameGroupLoading: updateFrameGroupRes.loading,
        async updateFrameGroup(
          frameGroupId: string,
          input: {
            name?: string
            locationX?: number
            locationY?: number
            width?: number
            height?: number
          }
        ) {
          const group = frameGroups.find((g) => g.id === frameGroupId)
          await updateFrameGroupMutation({
            variables: {
              orgId: orgId!,
              mapId,
              frameId: group?.frameId ?? '',
              id: frameGroupId,
              input,
            },
          })
          await loadCanvasPoints()
        },

        isDeleteFrameGroupLoading: deleteFrameGroupRes.loading,
        async deleteFrameGroup(frameGroupId: string) {
          const group = frameGroups.find((g) => g.id === frameGroupId)
          await deleteFrameGroupMutation({
            variables: {
              orgId: orgId!,
              mapId,
              frameId: group?.frameId ?? '',
              id: frameGroupId,
            },
          })
          await loadCanvasPoints()
        },
      }
    },
    {
      useChildrenProvider(children, value) {
        if (value.isPageCanvasLoading) return <SectionLoader />

        return children
      },
    }
  )
