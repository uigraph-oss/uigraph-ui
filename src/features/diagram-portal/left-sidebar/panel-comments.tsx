import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { SuperCircleLoader } from '@/components/loader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  COMMENTS,
  CREATE_COMMENT,
  DELETE_COMMENT,
  UPDATE_COMMENT,
  type UIComment,
} from '@/features/comments/api/comments'
import {
  InputEditor,
  InputRenderer,
} from '@/features/comments/components/input-editor'
import { cn } from '@/lib/utils'
import { useAuthStore, useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { useNodes, useReactFlow } from '@xyflow/react'
import { arrayNonNullable } from 'daily-code'
import {
  CrosshairIcon,
  EditIcon,
  MoreHorizontalIcon,
  PlusIcon,
  ReplyIcon,
  SendIcon,
  TrashIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { formatTimeAgo } from '../nodes/helpers/comment-helpers'
import { SidebarLayout } from './sidebar-layout'

export function SidebarComments() {
  const { sidebarActiveTool, setSidebarActiveTool } = useFlowDiagramContext()
  const { getNode, setCenter, setNodes } = useReactFlow()
  const isAddingComment = sidebarActiveTool === 'add-comment'

  function focusComment(nodeId: string) {
    const node = getNode(nodeId)
    if (!node) return

    const width = node.measured?.width ?? node.width ?? 0
    const height = node.measured?.height ?? node.height ?? 0
    void setCenter(node.position.x + width / 2, node.position.y + height / 2, {
      zoom: 1.5,
      duration: 600,
    })
    setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })))
  }
  const orgId = useCurrentOrganization()?.id
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser
    ? {
        userId: storeUser.userId,
        name: storeUser.name,
        avatarUrl: storeUser.avatarUrl ?? undefined,
      }
    : null

  const nodes = useNodes()
  const commentNodeIds = nodes
    .filter((node) => node.type === 'comment')
    .map((node) => node.id)
  const commentNodeIdsKey = commentNodeIds.join(',')

  const [byResource, setByResource] = useState<Record<string, UIComment[]>>({})

  const handleLoaded = useCallback(
    (resourceId: string, comments: UIComment[]) => {
      setByResource((prev) => ({ ...prev, [resourceId]: comments }))
    },
    []
  )

  const comments = useMemo(() => {
    return commentNodeIdsKey
      .split(',')
      .filter(Boolean)
      .flatMap((id) => byResource[id] ?? [])
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
  }, [commentNodeIdsKey, byResource])

  const resourceIdByComment = useMemo(() => {
    const map: Record<string, string> = {}
    commentNodeIdsKey
      .split(',')
      .filter(Boolean)
      .forEach((id) => {
        ;(byResource[id] ?? []).forEach((comment) => {
          map[comment.commentId] = id
        })
      })
    return map
  }, [commentNodeIdsKey, byResource])

  const [createCommentMutation] = useMutation(CREATE_COMMENT)
  const [updateCommentMutation] = useMutation(UPDATE_COMMENT)
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT)

  function refetchFor(resourceId: string) {
    return {
      awaitRefetchQueries: true,
      refetchQueries: [
        { query: COMMENTS, variables: { orgId: orgId!, resourceId } },
      ],
    }
  }

  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<{
    commentId: string
    name: string
  } | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(
    null
  )
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const lastCommentNodeId = commentNodeIds[commentNodeIds.length - 1]

  async function handleSend() {
    const normalized = replyText.trim()
    if (!normalized || isCreating || !user?.userId || !orgId) return

    const resourceId = replyTo
      ? resourceIdByComment[replyTo.commentId]
      : lastCommentNodeId
    if (!resourceId) return

    setIsCreating(true)
    try {
      await createCommentMutation({
        variables: {
          orgId,
          input: {
            resourceId,
            text: normalized,
            ...(replyTo ? { parentCommentId: replyTo.commentId } : {}),
          },
        },
        ...refetchFor(resourceId),
      })
      setReplyText('')
      setReplyTo(null)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleSaveEdit() {
    const normalized = editText.trim()
    if (!editingCommentId || !normalized || updatingCommentId || !orgId) return
    const resourceId = resourceIdByComment[editingCommentId]
    if (!resourceId) return

    setUpdatingCommentId(editingCommentId)
    try {
      await updateCommentMutation({
        variables: { orgId, id: editingCommentId, input: { text: normalized } },
        ...refetchFor(resourceId),
      })
      setEditingCommentId(null)
      setEditText('')
    } finally {
      setUpdatingCommentId(null)
    }
  }

  async function handleDelete(commentId: string) {
    if (deletingCommentId || !orgId) return
    const resourceId = resourceIdByComment[commentId]
    if (!resourceId) return

    setDeletingCommentId(commentId)
    try {
      await deleteCommentMutation({
        variables: { orgId, id: commentId },
        ...refetchFor(resourceId),
      })
    } finally {
      setDeletingCommentId(null)
    }
  }

  return (
    <SidebarLayout className="left-18">
      {commentNodeIds.map((id) => (
        <CommentCollector
          key={id}
          orgId={orgId}
          resourceId={id}
          onLoaded={handleLoaded}
        />
      ))}

      <div className="flex w-80 flex-col">
        <div className="flex items-center justify-between border-b border-[#2A3242] px-3 py-2.5">
          <h3 className="text-sm font-semibold text-[#F4F7FC]">Comments</h3>
          <button
            type="button"
            onClick={() =>
              setSidebarActiveTool(isAddingComment ? 'comments' : 'add-comment')
            }
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-all',
              isAddingComment
                ? 'border-primary bg-primary/15 text-primary'
                : 'hover:border-primary/40 border-[#2A3242] bg-[#1E2533] text-[#F4F7FC] hover:bg-[#232b3a]'
            )}
          >
            <PlusIcon
              className={cn(
                'size-3.5 transition-transform',
                isAddingComment && 'rotate-45'
              )}
            />
            {isAddingComment ? 'Click canvas' : 'Add comment'}
          </button>
        </div>

        <div className="max-h-96 overflow-x-hidden overflow-y-auto">
          <div className="divide-y divide-[#2A3242]">
            {comments.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#828DA3]">
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map((comment) => {
                const isEditing = editingCommentId === comment.commentId
                const isAuthor = user?.userId === comment.createdBy
                const displayName = comment.authorName || 'User'
                const parentName = comment.parentCommentId
                  ? comments.find(
                      (c) => c.commentId === comment.parentCommentId
                    )?.authorName
                  : null
                const isUpdating = updatingCommentId === comment.commentId
                const isDeleting = deletingCommentId === comment.commentId

                return (
                  <div key={comment.commentId} className="p-3">
                    <div className="flex items-start gap-2">
                      <Avatar className="size-5 flex-shrink-0">
                        <AvatarImage src={comment.authorAvatarUrl || ''} />
                        <AvatarFallback className="text-[10px]">
                          {(displayName.charAt(0) || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#F4F7FC]">
                            {displayName}
                          </span>
                          <span className="text-[11px] text-[#828DA3]">
                            {comment.createdAt
                              ? formatTimeAgo(comment.createdAt)
                              : ''}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <InputEditor
                              forceFocus
                              theme="dark"
                              value={editText}
                              setValue={setEditText}
                            />
                            <div className="flex gap-2">
                              <Button
                                preset="primary"
                                className="h-8 px-3 text-xs"
                                onClick={handleSaveEdit}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <SuperCircleLoader className="size-4!" />
                                ) : (
                                  'Save'
                                )}
                              </Button>
                              <Button
                                preset="outline"
                                className="h-8 px-3 text-xs"
                                onClick={() => {
                                  setEditingCommentId(null)
                                  setEditText('')
                                }}
                                disabled={isUpdating}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {!!comment.parentCommentId && (
                              <div className="text-[11px] text-[#828DA3]">
                                Replying to{' '}
                                <span className="font-medium text-[#F4F7FC]">
                                  {parentName || 'a comment'}
                                </span>
                              </div>
                            )}
                            <div className="text-sm leading-snug text-[#F4F7FC]">
                              <InputRenderer
                                theme="dark"
                                value={comment.text ?? ''}
                              />
                            </div>

                            <div className="flex items-center gap-1 text-[#828DA3]">
                              <Button
                                preset="ghost"
                                className="-ml-3 h-7 px-2! text-[11px] font-medium text-[#828DA3] hover:text-[#F4F7FC]"
                                onClick={() =>
                                  setReplyTo({
                                    commentId: comment.commentId,
                                    name: displayName,
                                  })
                                }
                              >
                                <ReplyIcon className="mr-1 size-3" />
                                Reply
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    preset="ghost"
                                    className="h-7 px-2! text-[11px] font-medium text-[#828DA3] hover:text-[#F4F7FC]"
                                  >
                                    <MoreHorizontalIcon className="size-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="min-w-40 rounded-lg border-[#2A3242] bg-[#141925] p-1 text-[#F4F7FC] shadow-xl"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      focusComment(
                                        resourceIdByComment[comment.commentId]
                                      )
                                    }
                                    className="cursor-pointer gap-2 rounded-md px-2.5 py-2 text-sm text-[#F4F7FC] focus:bg-[#1E2533] focus:text-[#F4F7FC]"
                                  >
                                    <CrosshairIcon className="size-4" />
                                    Focus Comment
                                  </DropdownMenuItem>
                                  {isAuthor && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingCommentId(comment.commentId)
                                          setEditText(comment.text ?? '')
                                        }}
                                        className="cursor-pointer gap-2 rounded-md px-2.5 py-2 text-sm text-[#F4F7FC] focus:bg-[#1E2533] focus:text-[#F4F7FC]"
                                      >
                                        <EditIcon className="size-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setDeleteTarget(comment.commentId)
                                        }
                                        className="text-destructive focus:text-destructive cursor-pointer gap-2 rounded-md px-2.5 py-2 text-sm focus:bg-[#1E2533]"
                                        disabled={isDeleting}
                                      >
                                        <TrashIcon className="size-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="border-t border-[#2A3242] px-3 py-2.5">
          <div className="space-y-2">
            {!!replyTo && (
              <div className="flex items-center justify-between gap-2 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 py-2 text-xs text-[#828DA3]">
                <div className="min-w-0 flex-1 truncate">
                  Replying to{' '}
                  <span className="font-medium text-[#F4F7FC]">
                    {replyTo.name}
                  </span>
                </div>
                <Button
                  preset="outline"
                  disabled={isCreating}
                  onClick={() => setReplyTo(null)}
                  className="h-7 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            )}

            <div className="relative flex min-w-0 flex-1 items-end gap-2">
              <div className="flex-1">
                <InputEditor
                  theme="dark"
                  value={replyText}
                  setValue={setReplyText}
                  className="break-all"
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={!replyText.trim() || isCreating || !lastCommentNodeId}
                preset="primary"
                className="size-9! p-0"
              >
                {isCreating ? (
                  <SuperCircleLoader className="size-4" />
                ) : (
                  <SendIcon className="size-4!" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BetterDeleteConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete comment?"
        description="This action cannot be undone."
        onConfirm={async () => {
          if (!deleteTarget) return
          await handleDelete(deleteTarget)
          setDeleteTarget(null)
        }}
      />
    </SidebarLayout>
  )
}

function CommentCollector({
  orgId,
  resourceId,
  onLoaded,
}: {
  orgId: string | undefined
  resourceId: string
  onLoaded: (resourceId: string, comments: UIComment[]) => void
}) {
  const { data } = useQuery(COMMENTS, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId!, resourceId },
    skip: !orgId,
  })

  const comments = useMemo<UIComment[]>(() => {
    return arrayNonNullable(data?.comments).map((c) => ({
      commentId: c.id,
      resourceId: c.resourceId,
      parentCommentId: c.parentCommentId,
      text: c.text,
      createdBy: c.createdBy,
      createdAt: c.createdAt,
      authorName: c.createdByActor?.name,
      authorAvatarUrl: c.createdByActor?.avatarUrl,
    }))
  }, [data])

  useEffect(() => {
    onLoaded(resourceId, comments)
  }, [resourceId, comments, onLoaded])

  return null
}
