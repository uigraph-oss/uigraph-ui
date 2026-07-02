import { GT } from '@/api'
import { FocalPoint } from '@/features/dashboard-pages/api/focal-point'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { createContext } from 'daily-code/react'
import {
  CREATE_FOCAL_POINT_META,
  DELETE_FOCAL_POINT_META,
  FOCAL_POINT_META,
  UPDATE_FOCAL_POINT_META,
} from '../api/focal-point-meta'
type PointMetaInput = {
  componentModalFields?: GT.ComponentModalFieldInput[]
  componentLinkDiagramId?: string
  componentLinkApiEndpointId?: string
  componentLinkTestPackId?: string
  componentLinkServiceDocId?: string
}

export const [FocalPointSidebarContextProvider, useFocalPointSidebarContext] =
  createContext(
    ({ focalPoint, mapId }: { focalPoint: FocalPoint; mapId: string }) => {
      const orgId = useCurrentOrganization()?.id
      const frameId = focalPoint.frameId ?? ''
      const focalPointId = focalPoint.id

      const vars = { orgId: orgId!, mapId, frameId, focalPointId }
      const skip = !orgId || !mapId || !frameId

      const metaRes = useQuery(FOCAL_POINT_META, {
        variables: vars,
        skip,
      })

      const refetch = [{ query: FOCAL_POINT_META, variables: vars }]
      const mutationBase = {
        awaitRefetchQueries: true,
        refetchQueries: refetch,
      }

      const [createMeta] = useMutation(CREATE_FOCAL_POINT_META, mutationBase)
      const [updateMeta] = useMutation(UPDATE_FOCAL_POINT_META, mutationBase)
      const [deleteMeta] = useMutation(DELETE_FOCAL_POINT_META, mutationBase)

      const pointMeta = metaRes.data?.focalPointMeta ?? []

      function buildInput(componentId: string, input: PointMetaInput) {
        return { componentId, ...input }
      }

      return {
        focalPoint,

        pointMeta,
        pointMetaLoading: metaRes.loading && !metaRes.data?.focalPointMeta,

        createPointMeta(componentId: string, input: PointMetaInput) {
          return createMeta({
            variables: { ...vars, input: buildInput(componentId, input) },
          })
        },

        updatePointMeta(
          pointMetaId: string,
          componentId: string,
          input: PointMetaInput
        ) {
          return updateMeta({
            variables: {
              ...vars,
              id: pointMetaId,
              input: buildInput(componentId, input),
            },
          })
        },

        deletePointMeta(pointMetaId: string) {
          return deleteMeta({ variables: { ...vars, id: pointMetaId } })
        },
      }
    }
  )
