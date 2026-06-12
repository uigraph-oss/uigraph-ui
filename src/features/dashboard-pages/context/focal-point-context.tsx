import { GT } from '@/api'
import { useOrganizationContext } from '@/contexts'
import { GET_PAGE, GET_PROJECT } from '@/features/dashboard-projects/api'
import { isPointWithinRect } from '@/features/image-frame-canvas/helpers'
import { useCanvasTarget } from '@/features/image-frame-canvas/hooks/use-canvas-target'
import { useLocalStorage } from '@/hooks/use-localstorage'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CREATE_FOCAL_POINT,
  CREATE_FRAME_GROUP,
  CREATE_PAGE_PAGE_LINK,
  CREATE_PAGE_PROJECT_LINK,
  DELETE_FOCAL_POINT,
  DELETE_PAGE_PAGE_LINK,
  DELETE_PAGE_PROJECT_LINK,
  UPDATE_FOCAL_POINT,
  UPDATE_PAGE_PAGE_LINK,
  UPDATE_PAGE_PROJECT_LINK,
} from '../api'
import { GET_CANVAS_POINTS } from '../api/canvas'
import { DELETE_FRAME_GROUP, UPDATE_FRAME_GROUP } from '../api/frame-group'
import { FocalPointPreset } from '../types'

export const [FocalPointContextProvider, useFocalPointContext] = createContext(
  () => {
    const { pageId } = useParams() as { pageId?: string }
    const canvasTarget = useCanvasTarget()

    const { organizationId } = useOrganizationContext()

    const pageQuery = useQuery(GET_PAGE, {
      fetchPolicy: 'cache-first',
      variables: { pageId: String(pageId) },
      skip: !pageId,
    })

    const canvasQuery = useQuery(GET_CANVAS_POINTS, {
      fetchPolicy: 'cache-first',
      variables: { pageId: String(pageId) },
      skip: !pageId,
    })

    const page = useMemo(
      () => pageQuery.data?.v1GetPage?.[0] ?? null,
      [pageQuery.data?.v1GetPage]
    )

    const projectQuery = useQuery(GET_PROJECT, {
      fetchPolicy: 'cache-first',
      variables: { projectId: String(page?.projectId), organizationId },
      skip: !page?.projectId,
    })

    const [zoom, setZoom] = useState(100)

    const LOCAL_STORAGE_KEY = `focal-point-preset:${pageId}`
    const [preset, setPreset] = useLocalStorage<FocalPointPreset | null>(
      LOCAL_STORAGE_KEY,
      null
    )

    const [newPoint, setNewPoint] = useState<{
      type: 'focal' | 'link'
      position: {
        x: number
        y: number
      } | null
    } | null>(null)

    const [drawRectMode, setDrawRectMode] = useState<{
      type: 'group'
      position: {
        x: number
        y: number
        width: number
        height: number
      } | null
    } | null>(null)

    const commonMutationOptions = {
      awaitRefetchQueries: true,
      refetchQueries: [GET_CANVAS_POINTS],
    }

    const [createFocalPoint] = useMutation(
      CREATE_FOCAL_POINT,
      commonMutationOptions
    )

    const [updateFocalPoint] = useMutation(
      UPDATE_FOCAL_POINT,
      commonMutationOptions
    )

    const [deleteFocalPoint] = useMutation(
      DELETE_FOCAL_POINT,
      commonMutationOptions
    )

    const [createFrameGroup] = useMutation(
      CREATE_FRAME_GROUP,
      commonMutationOptions
    )

    const [updateFrameGroup] = useMutation(
      UPDATE_FRAME_GROUP,
      commonMutationOptions
    )

    const [deleteFrameGroup] = useMutation(
      DELETE_FRAME_GROUP,
      commonMutationOptions
    )

    const [createPageLink] = useMutation(
      CREATE_PAGE_PAGE_LINK,
      commonMutationOptions
    )

    const [updatePageLink] = useMutation(
      UPDATE_PAGE_PAGE_LINK,
      commonMutationOptions
    )

    const [deletePageLink] = useMutation(
      DELETE_PAGE_PAGE_LINK,
      commonMutationOptions
    )

    const [createProjectLink] = useMutation(
      CREATE_PAGE_PROJECT_LINK,
      commonMutationOptions
    )

    const [updateProjectLink] = useMutation(
      UPDATE_PAGE_PROJECT_LINK,
      commonMutationOptions
    )

    const [deleteProjectLink] = useMutation(
      DELETE_PAGE_PROJECT_LINK,
      commonMutationOptions
    )

    const project = useMemo(
      () => projectQuery.data?.v1GetProject?.[0] ?? null,
      [projectQuery.data?.v1GetProject]
    )

    const canvasInfo = useMemo(() => {
      return {
        focalPoints: arrayNonNullable(canvasQuery.data?.v1GetFocalPoint),
        frameGroups: arrayNonNullable(canvasQuery.data?.v1GetPageGroup),
        pageLinks: arrayNonNullable(canvasQuery.data?.v1GetPagePageLink),
        projectLinks: arrayNonNullable(canvasQuery.data?.v1GetPageProjectLink),
      }
    }, [canvasQuery.data])

    const selectedFocalPoint = useMemo(() => {
      return canvasInfo.focalPoints.find(
        (f) => f.focalPointId === canvasTarget.focalPoint
      )
    }, [canvasInfo.focalPoints, canvasTarget.focalPoint])

    const selectedFrameGroup = useMemo(() => {
      return canvasInfo.frameGroups.find(
        (g) => g.pageGroupId === canvasTarget.frameGroup
      )
    }, [canvasInfo.frameGroups, canvasTarget.frameGroup])

    const selectedFrameGroupPoints = useMemo(() => {
      if (!selectedFrameGroup || canvasInfo.focalPoints.length === 0) return []

      return canvasInfo.focalPoints.filter((f) =>
        isPointWithinRect(
          {
            x: selectedFrameGroup.locationX!,
            y: selectedFrameGroup.locationY!,
            width: selectedFrameGroup.width!,
            height: selectedFrameGroup.height!,
          },
          {
            x: f.locationX!,
            y: f.locationY!,
          }
        )
      )
    }, [canvasInfo.focalPoints, selectedFrameGroup])

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

      page,
      pageLoading: !page && pageQuery.loading,

      project,
      projectLoading:
        (!page && pageQuery.loading) || (!project && projectQuery.loading),

      focalPoints: canvasInfo.focalPoints,
      frameGroups: canvasInfo.frameGroups,
      pageLinks: canvasInfo.pageLinks,
      projectLinks: canvasInfo.projectLinks,

      createFocalPoint(
        input: Omit<GT.CreateFocalPointInput, 'pageId' | 'organizationId'>
      ) {
        return createFocalPoint({
          variables: {
            input: {
              ...input,
              organizationId,
              pageId: String(pageId),
            },
          },
        })
      },

      async updateFocalPoint(
        pointId: string,
        input: Omit<GT.UpdateFocalPointInput, 'pageId' | 'organizationId'>
      ) {
        await updateFocalPoint({
          variables: {
            focalPointId: pointId,
            input: {
              ...input,
              organizationId,
              pageId: String(pageId),
            },
          },
        })
      },

      async deleteFocalPoint(pointId: string) {
        await deleteFocalPoint({
          variables: { focalPointId: pointId },
        })
      },

      createFrameGroup(
        input: Omit<GT.CreatePageGroupInput, 'pageId' | 'organizationId'>
      ) {
        return createFrameGroup({
          variables: {
            input: {
              ...input,
              organizationId,
              pageId: String(pageId),
            },
          },
        })
      },

      updateFrameGroup(
        pageGroupId: string,
        input: Omit<GT.UpdatePageGroupInput, 'pageId' | 'organizationId'>
      ) {
        return updateFrameGroup({
          variables: {
            pageGroupId,
            input: {
              ...input,
              organizationId,
              pageId: String(pageId),
            },
          },
        })
      },

      deleteFrameGroup(pageGroupId: string) {
        return deleteFrameGroup({ variables: { pageGroupId } })
      },

      createPageLink(
        input: Omit<GT.CreatePagePageLinkInput, 'pageId' | 'organizationId'>
      ) {
        return createPageLink({
          variables: {
            input: { ...input, organizationId, pageId: String(pageId) },
          },
        })
      },

      updatePageLink(
        linkId: string,
        input: Omit<GT.UpdatePagePageLinkInput, 'pageId' | 'organizationId'>
      ) {
        return updatePageLink({
          variables: {
            linkId,
            input: { ...input, organizationId, pageId: String(pageId) },
          },
        })
      },

      deletePageLink(linkId: string) {
        return deletePageLink({ variables: { linkId } })
      },

      createProjectLink(
        input: Omit<GT.CreatePageProjectLinkInput, 'pageId' | 'organizationId'>
      ) {
        return createProjectLink({
          variables: {
            input: { ...input, organizationId, pageId: String(pageId) },
          },
        })
      },

      updateProjectLink(
        linkId: string,
        input: Omit<GT.UpdatePageProjectLinkInput, 'pageId' | 'organizationId'>
      ) {
        return updateProjectLink({
          variables: {
            linkId,
            input: { ...input, organizationId, pageId: String(pageId) },
          },
        })
      },

      deleteProjectLink(linkId: string) {
        return deleteProjectLink({ variables: { linkId } })
      },
    }
  }
)
