'use client'

import { GT } from '@/api'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputEditor,
  InputRenderer,
} from '@/features/comments/components/input-editor'
import { formatDistanceToNow } from 'date-fns'
import {
  EditIcon,
  MoreHorizontalIcon,
  ReplyIcon,
  TrashIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCommentsContext } from '../../comments/contexts/comments-context'
import { usePublicAccount } from '../hooks/use-public-account'

type CommentItemProps = {
  comment: GT.Comment
}

export function CommentItem({ comment }: CommentItemProps) {
  const { name, avatarSrc } = usePublicAccount(comment.createdBy)

  const { comments, setReplyToCommentId, updateComment, deleteComment } =
    useCommentsContext()

  const parentComment = comments.find(
    (c) => c.commentId && c.commentId === comment.parentCommentId
  )
  const { name: parentName } = usePublicAccount(parentComment?.createdBy)

  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text ?? '')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (!isEditing) {
      setEditText(comment.text ?? '')
    }
  }, [comment.text, isEditing])

  return (
    <>
      <div className="rounded-lg bg-gray-50 p-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={avatarSrc ?? ''} className="object-cover" />

            <AvatarFallback>
              {((name || 'User').charAt(0) || '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {!!comment.parentCommentId && (
              <div className="mb-1 text-xs text-gray-500">
                Replying to{' '}
                <span className="font-medium text-gray-700">
                  {parentName || 'a comment'}
                </span>
              </div>
            )}
            <div className="mb-1 flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {name}
                </span>
                <span className="text-xs text-gray-500">
                  {comment.createdAt
                    ? formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })
                    : 'Just now'}
                </span>
              </div>
              {!isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <MoreHorizontalIcon className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        if (!comment.commentId) return
                        setReplyToCommentId(comment.commentId)
                      }}
                      className="text-xs"
                    >
                      <ReplyIcon className="size-3" />
                      Reply
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        setIsEditing(true)
                      }}
                      className="text-xs"
                    >
                      <EditIcon className="size-3" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        if (!comment.commentId) return
                        setIsDeleteModalOpen(true)
                      }}
                      variant="destructive"
                      className="text-xs"
                    >
                      <TrashIcon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <InputEditor value={editText} setValue={setEditText} />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!comment.commentId) return
                      const normalized = editText.trim()
                      if (!normalized) return
                      await updateComment({
                        variables: {
                          commentId: comment.commentId,
                          input: { text: normalized },
                        },
                      })
                      setIsEditing(false)
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <InputRenderer value={comment.text ?? ''} />
            )}
          </div>
        </div>
      </div>

      <BetterDeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => setIsDeleteModalOpen(open)}
        title="Delete comment?"
        description="This action cannot be undone."
        onConfirm={async () => {
          if (!comment.commentId) return
          await deleteComment({
            variables: { commentId: comment.commentId },
          })
        }}
      />
    </>
  )
}
