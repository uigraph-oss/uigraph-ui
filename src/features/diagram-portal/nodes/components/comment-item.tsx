import { GT } from '@/api'
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
  InputEditor,
  InputRenderer,
} from '@/features/comments/components/input-editor'
import { usePublicAccount } from '@/features/image-frame-canvas-sidebar/hooks/use-public-account'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  EditIcon,
  MoreHorizontalIcon,
  ReplyIcon,
  TrashIcon,
} from 'lucide-react'
import { useState } from 'react'
import { formatTimeAgo } from '../helpers/comment-helpers'

type CommentItemProps = {
  comment: GT.Comment
  allComments: GT.Comment[]
  editingCommentId: string | null
  editText: string
  user: {
    userId: string
    name?: string
    pic?: string
  } | null
  updatingCommentId: string | null
  deletingCommentId: string | null
  onEdit: (commentId: string, currentContent: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (commentId: string) => Promise<unknown>
  onReply: (commentId: string, authorName: string) => void
  onEditTextChange: (text: string) => void
}

export function CommentItem({
  comment,
  allComments,
  editingCommentId,
  editText,
  user,
  updatingCommentId,
  deletingCommentId,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onReply,
  onEditTextChange,
}: CommentItemProps) {
  const isEditing = editingCommentId === comment.commentId
  const isAuthor = user?.userId === comment.createdBy
  const { name, avatarSrc } = usePublicAccount(comment.createdBy)
  const displayName = name || 'User'
  const parentComment = allComments.find(
    (c) => c.commentId && c.commentId === comment.parentCommentId
  )
  const { name: parentName } = usePublicAccount(parentComment?.createdBy)
  const isUpdating =
    !!comment.commentId && updatingCommentId === comment.commentId
  const isDeleting =
    !!comment.commentId && deletingCommentId === comment.commentId
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <motion.div
      className={cn('space-y-2')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-2">
        <Avatar className="size-5 flex-shrink-0">
          <AvatarImage src={avatarSrc || ''} />
          <AvatarFallback className="text-[10px]">
            {(displayName.charAt(0) || 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-[13px] font-medium">
              {displayName}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {comment.createdAt ? formatTimeAgo(comment.createdAt) : ''}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <InputEditor
                forceFocus
                value={editText}
                setValue={onEditTextChange}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onSaveEdit} disabled={isUpdating}>
                  {isUpdating ? (
                    <SuperCircleLoader className="size-4!" />
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancelEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {!!comment.parentCommentId && (
                <div className="text-muted-foreground text-[11px]">
                  Replying to{' '}
                  <span className="text-foreground/80 font-medium">
                    {parentName || 'a comment'}
                  </span>
                </div>
              )}
              <div className="text-foreground text-sm leading-snug">
                <InputRenderer value={comment.text ?? ''} />
              </div>

              <div className="text-muted-foreground flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:text-foreground -ml-3 h-7 px-2! text-[11px] font-medium"
                  onClick={() => {
                    if (!comment.commentId) return
                    onReply(comment.commentId, displayName)
                  }}
                >
                  <ReplyIcon className="mr-1 size-3" />
                  Reply
                </Button>

                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:text-foreground h-7 px-2! text-[11px] font-medium"
                      >
                        <MoreHorizontalIcon className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          if (!comment.commentId) return
                          onEdit(comment.commentId, comment.text ?? '')
                        }}
                      >
                        <EditIcon className="size-3" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (!comment.commentId) return
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-destructive"
                        disabled={isDeleting}
                      >
                        <TrashIcon className="size-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <BetterDeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => setIsDeleteModalOpen(open)}
        title="Delete comment?"
        description="This action cannot be undone."
        onConfirm={async () => {
          if (!comment.commentId) return
          await onDelete(comment.commentId)
        }}
      />
    </motion.div>
  )
}
