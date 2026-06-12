import { GT } from '@/api'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import {
  CREATE_FOCAL_POINT_META,
  DELETE_FOCAL_POINT_META,
  GET_FOCAL_POINT_META,
  UPDATE_FOCAL_POINT_META,
} from '../api/focal-point-meta'

export const [FocalPointSidebarContextProvider, useFocalPointSidebarContext] =
  createContext(({ focalPoint }: { focalPoint: GT.FocalPoint }) => {
    const metaRes = useQuery(GET_FOCAL_POINT_META, {
      variables: { focalPointId: focalPoint.focalPointId! },
    })

    const [createPointMeta] = useMutation(CREATE_FOCAL_POINT_META, {
      awaitRefetchQueries: true,
      refetchQueries: [GET_FOCAL_POINT_META],
    })

    const [updatePointMeta] = useMutation(UPDATE_FOCAL_POINT_META, {
      awaitRefetchQueries: true,
      refetchQueries: [GET_FOCAL_POINT_META],
    })

    const [deletePointMeta] = useMutation(DELETE_FOCAL_POINT_META, {
      awaitRefetchQueries: true,
      refetchQueries: [GET_FOCAL_POINT_META],
    })

    return {
      focalPoint,

      pointMeta: arrayNonNullable(metaRes.data?.v1GetFocalPointMeta),
      pointMetaLoading: metaRes.loading && !metaRes.data?.v1GetFocalPointMeta,

      createPointMeta(
        componentId: string,
        input: Omit<
          GT.CreateFocalPointMetaInput,
          'focalPointId' | 'pageId' | 'organizationId' | 'componentId'
        >
      ) {
        return createPointMeta({
          variables: {
            input: {
              ...input,
              componentId,
              pageId: focalPoint.pageId!,
              focalPointId: focalPoint.focalPointId!,
              organizationId: focalPoint.organizationId!,
            },
          },
        })
      },

      updatePointMeta(
        pointMetaId: string,
        componentId: string,
        input: Omit<
          GT.UpdateFocalPointMetaInput,
          'focalPointId' | 'pageId' | 'organizationId' | 'componentId'
        >
      ) {
        return updatePointMeta({
          variables: {
            focalPointMetaId: pointMetaId,
            input: {
              ...input,
              componentId,
              pageId: focalPoint.pageId!,
              focalPointId: focalPoint.focalPointId!,
              organizationId: focalPoint.organizationId!,
            },
          },
        })
      },

      deletePointMeta(focalPointMetaId: string) {
        return deletePointMeta({
          variables: { focalPointMetaId },
        })
      },
    }
  })
