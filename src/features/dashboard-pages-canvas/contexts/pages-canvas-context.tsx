import { GT, privateClient } from '@/api'
import { SectionLoader } from '@/components/section-loader'
import {
  DELETE_FOCAL_POINT,
  DELETE_FRAME_GROUP,
  GET_FOCAL_POINT,
  GET_FRAME_GROUP,
  UPDATE_FOCAL_POINT,
  UPDATE_FRAME_GROUP,
} from '@/features/dashboard-pages/api'
import { GET_CANVAS_POINTS } from '@/features/dashboard-pages/api/canvas'
import { isPointWithinRect } from '@/features/image-frame-canvas/helpers'
import { useCanvasTarget } from '@/features/image-frame-canvas/hooks/use-canvas-target'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useEffect, useMemo, useState } from 'react'
import { CREATE_PAGE_CANVAS, GET_PAGE_CANVAS } from '../api'

export type PagesCanvasContextInput = {
  pages: GT.Page[]
  project: GT.Project
}

export const [PagesCanvasContextProvider, usePagesCanvasContext] =
  createContext(
    ({ pages, project }: PagesCanvasContextInput) => {
      const canvasTarget = useCanvasTarget()
      const [zoom, setZoom] = useState(0)

      const pageCanvasRes = useQuery(GET_PAGE_CANVAS, {
        variables: {
          projectId: project.projectId!,
          organizationId: project.organizationId!,
        },
      })

      const [createPageCanvas, createPageCanvasRes] = useMutation(
        CREATE_PAGE_CANVAS,
        {
          awaitRefetchQueries: true,
          refetchQueries: [
            {
              query: GET_PAGE_CANVAS,
              variables: {
                projectId: project.projectId!,
                organizationId: project.organizationId!,
              },
            },
          ],
        }
      )

      const [focalPoints, setFocalPoints] = useState<GT.FocalPoint[]>([])
      const [frameGroups, setFrameGroups] = useState<GT.PageGroup[]>([])
      const [pageLinks, setPageLinks] = useState<GT.PagePageLink[]>([])
      const [projectLinks, setProjectLinks] = useState<GT.PageProjectLink[]>([])

      useEffect(() => {
        async function loadCanvasPoints() {
          const promises = pages.map((page) =>
            privateClient.query({
              query: GET_CANVAS_POINTS,
              variables: { pageId: page.pageId! },
            })
          )

          const results = await Promise.all(promises)
          const frameGroupsData = results
            .map((result) => arrayNonNullable(result.data.v1GetPageGroup))
            .flat()
          const focalPointsData = results
            .map((result) => arrayNonNullable(result.data.v1GetFocalPoint))
            .flat()
          const pageLinksData = results
            .map((result) => arrayNonNullable(result.data.v1GetPagePageLink))
            .flat()
          const projectLinksData = results
            .map((result) => arrayNonNullable(result.data.v1GetPageProjectLink))
            .flat()

          setFocalPoints(focalPointsData)
          setFrameGroups(frameGroupsData)
          setPageLinks(pageLinksData)
          setProjectLinks(projectLinksData)
        }

        loadCanvasPoints().catch(console.error)
      }, [pages])

      const selectedFocalPointId = canvasTarget.focalPoint
      const selectedFocalPoint = useMemo(
        () => focalPoints.find((f) => f.focalPointId === selectedFocalPointId),
        [focalPoints, selectedFocalPointId]
      )

      const selectedFrameGroupId = canvasTarget.frameGroup
      const selectedFrameGroup = useMemo(
        () => frameGroups.find((g) => g.pageGroupId === selectedFrameGroupId),
        [frameGroups, selectedFrameGroupId]
      )

      const [updateFocalPoint, updateFocalPointRes] = useMutation(
        UPDATE_FOCAL_POINT,
        {
          awaitRefetchQueries: true,
          refetchQueries: [GET_FOCAL_POINT],
        }
      )

      const [deleteFocalPoint, deleteFocalPointRes] = useMutation(
        DELETE_FOCAL_POINT,
        {
          awaitRefetchQueries: true,
          refetchQueries: [GET_FOCAL_POINT],
        }
      )

      const [updateFrameGroup, updateFrameGroupRes] = useMutation(
        UPDATE_FRAME_GROUP,
        {
          awaitRefetchQueries: true,
          refetchQueries: [GET_FRAME_GROUP],
        }
      )

      const [deleteFrameGroup, deleteFrameGroupRes] = useMutation(
        DELETE_FRAME_GROUP,
        {
          awaitRefetchQueries: true,
          refetchQueries: [GET_FRAME_GROUP],
        }
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

        isCreatePageCanvasLoading: createPageCanvasRes.loading,
        createPageCanvas(
          zoom: number,
          pageCanvasItems: GT.PageCanvasItemInput[]
        ) {
          return createPageCanvas({
            variables: {
              input: {
                organizationId: project.organizationId!,
                projectId: project.projectId!,
                pageCanvasItems,
                zoom,
              },
            },
          })
        },

        isPageCanvasLoading: pageCanvasRes.loading,
        pageCanvasZoom: pageCanvasRes.data?.v1GetPageCanvas?.zoom,
        pageCanvasItems: pageCanvasRes.data?.v1GetPageCanvas?.pageCanvasItems,

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
        updateFocalPoint(
          focalPointId: string,
          input: GT.UpdateFocalPointInput
        ) {
          return updateFocalPoint({
            variables: {
              focalPointId,
              input,
            },
          })
        },

        isDeleteFocalPointLoading: deleteFocalPointRes.loading,
        deleteFocalPoint(focalPointId: string) {
          return deleteFocalPoint({
            variables: {
              focalPointId,
            },
          })
        },

        isUpdateFrameGroupLoading: updateFrameGroupRes.loading,
        updateFrameGroup(frameGroupId: string, input: GT.UpdatePageGroupInput) {
          return updateFrameGroup({
            variables: { pageGroupId: frameGroupId, input },
          })
        },

        isDeleteFrameGroupLoading: deleteFrameGroupRes.loading,
        deleteFrameGroup(frameGroupId: string) {
          return deleteFrameGroup({
            variables: { pageGroupId: frameGroupId },
          })
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
