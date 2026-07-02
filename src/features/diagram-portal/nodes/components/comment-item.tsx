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
import type { UIComment } from '@/features/comments/api/comments'
import {
  InputEditor,
  InputRenderer,
} from '@/features/comments/components/input-editor'
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
  comment: UIComment
  allComments: UIComment[]
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
  const avatarSrc = comment.authorAvatarUrl ?? ''
  const displayName = comment.authorName || 'User'
  const parentComment = allComments.find(
    (c) => c.commentId && c.commentId === comment.parentCommentId
  )
  const parentName = parentComment?.authorName
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
            <span className="text-[13px] font-medium text-[#F4F7FC]">
              {displayName}
            </span>
            <span className="text-[11px] text-[#828DA3]">
              {comment.createdAt ? formatTimeAgo(comment.createdAt) : ''}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <InputEditor
                forceFocus
                theme="dark"
                value={editText}
                setValue={onEditTextChange}
              />
              <div className="flex gap-2">
                <Button
                  preset="primary"
                  className="h-8 px-3 text-xs"
                  onClick={onSaveEdit}
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
                <div className="text-[11px] text-[#828DA3]">
                  Replying to{' '}
                  <span className="font-medium text-[#F4F7FC]">
                    {parentName || 'a comment'}
                  </span>
                </div>
              )}
              <div className="text-sm leading-snug text-[#F4F7FC]">
                <InputRenderer theme="dark" value={comment.text ?? ''} />
              </div>

              <div className="flex items-center gap-1 text-[#828DA3]">
                <Button
                  preset="ghost"
                  className="-ml-3 h-7 px-2! text-[11px] font-medium text-[#828DA3] hover:text-[#F4F7FC]"
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
                        onClick={() => {
                          if (!comment.commentId) return
                          onEdit(comment.commentId, comment.text ?? '')
                        }}
                        className="cursor-pointer gap-2 rounded-md px-2.5 py-2 text-sm text-[#F4F7FC] focus:bg-[#1E2533] focus:text-[#F4F7FC]"
                      >
                        <EditIcon className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (!comment.commentId) return
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-destructive focus:text-destructive cursor-pointer gap-2 rounded-md px-2.5 py-2 text-sm focus:bg-[#1E2533]"
                        disabled={isDeleting}
                      >
                        <TrashIcon className="size-4" />
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
