import { clientV2 } from '@/api/client'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useCallback, useMemo, useState } from 'react'
import {
  COMMENTS,
  CREATE_COMMENT,
  DELETE_COMMENT,
  UPDATE_COMMENT,
  type UIComment,
} from '../api/comments'

export const [CommentsContextProvider, useCommentsContext] = createContext(
  ({ resourceId }: { resourceId: string }) => {
    const orgId = useCurrentOrganization()?.id
    const [replyToCommentId, setReplyToCommentId] = useState<string | null>(
      null
    )

    const { data, loading } = useQuery(COMMENTS, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, resourceId },
      skip: !orgId,
    })

    const refetchQueries = [
      { query: COMMENTS, variables: { orgId: orgId!, resourceId } },
    ]

    const [createCommentMutation] = useMutation(CREATE_COMMENT, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries,
    })

    const [updateCommentMutation] = useMutation(UPDATE_COMMENT, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries,
    })

    const [deleteCommentMutation] = useMutation(DELETE_COMMENT, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries,
    })

    const comments = useMemo<UIComment[]>(() => {
      return arrayNonNullable(data?.comments)
        .map((c) => ({
          commentId: c.id,
          resourceId: c.resourceId,
          parentCommentId: c.parentCommentId,
          text: c.text,
          createdBy: c.createdBy,
          createdAt: c.createdAt,
          authorName: c.createdByActor?.name,
          authorAvatarUrl: c.createdByActor?.avatarUrl,
        }))
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    }, [data])

    const createComment = useCallback(
      async (input: { text: string; parentCommentId?: string | null }) => {
        if (!orgId) return
        await createCommentMutation({
          variables: {
            orgId,
            input: {
              resourceId,
              text: input.text,
              ...(input.parentCommentId
                ? { parentCommentId: input.parentCommentId }
                : {}),
            },
          },
        })
      },
      [orgId, resourceId, createCommentMutation]
    )

    const updateComment = useCallback(
      async (commentId: string, text: string) => {
        if (!orgId) return
        await updateCommentMutation({
          variables: { orgId, id: commentId, input: { text } },
        })
      },
      [orgId, updateCommentMutation]
    )

    const deleteComment = useCallback(
      async (commentId: string) => {
        if (!orgId) return
        await deleteCommentMutation({
          variables: { orgId, id: commentId },
        })
      },
      [orgId, deleteCommentMutation]
    )

    return {
      resourceId,

      comments,
      isLoading: loading && !data?.comments,

      createComment,
      updateComment,
      deleteComment,

      replyToCommentId,
      setReplyToCommentId,
    }
  }
)
