import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo, useState } from 'react'
import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  GET_COMMENT,
  UPDATE_COMMENT,
} from '../../image-frame-canvas-sidebar/api/comments'

export const [CommentsContextProvider, useCommentsContext] = createContext(
  ({ resourceId }: { resourceId: string }) => {
    const [replyToCommentId, setReplyToCommentId] = useState<string | null>(
      null
    )

    const { data, loading } = useQuery(GET_COMMENT, {
      fetchPolicy: 'cache-first',
      variables: { resourceId },
    })

    const [createComment] = useMutation(CREATE_COMMENT, {
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_COMMENT, variables: { resourceId } }],
    })

    const [updateComment] = useMutation(UPDATE_COMMENT, {
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_COMMENT, variables: { resourceId } }],
    })

    const [deleteComment] = useMutation(DELETE_COMMENT, {
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_COMMENT, variables: { resourceId } }],
    })

    const comments = useMemo(() => {
      return arrayNonNullable(data?.v1GetComment).sort((a, b) => {
        return (
          new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
        )
      })
    }, [data])

    return {
      resourceId,

      comments,
      isLoading: loading && !data?.v1GetComment,

      createComment,
      updateComment,
      deleteComment,

      replyToCommentId,
      setReplyToCommentId,
    }
  }
)
