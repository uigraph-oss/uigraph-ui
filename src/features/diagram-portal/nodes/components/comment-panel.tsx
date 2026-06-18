import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import type { UIComment } from '@/features/comments/api/comments-v2'
import { InputEditor } from '@/features/comments/components/input-editor'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CheckIcon, SendIcon, XIcon } from 'lucide-react'
import { CommentItem } from './comment-item'

type CommentPanelProps = {
  comments: UIComment[]
  isResolved: boolean
  user: {
    userId: string
    name?: string
    pic?: string
  } | null
  replyText: string
  replyToName: string | null
  editingCommentId: string | null
  editText: string
  isCreating: boolean
  updatingCommentId: string | null
  deletingCommentId: string | null
  onToggleResolved: () => void
  onClose: () => void
  onReplyTextChange: (text: string) => void
  onReply: () => void
  onCancelReply: () => void
  onEdit: (commentId: string, currentContent: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (commentId: string) => Promise<unknown>
  onReplyToAuthor: (commentId: string, authorName: string) => void
  onEditTextChange: (text: string) => void
}

export function CommentPanel({
  comments,
  isResolved,
  user,
  replyText,
  replyToName,
  editingCommentId,
  editText,
  isCreating,
  updatingCommentId,
  deletingCommentId,
  onToggleResolved,
  onClose,
  onReplyTextChange,
  onReply,
  onCancelReply,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onReplyToAuthor,
  onEditTextChange,
}: CommentPanelProps) {
  return (
    <motion.div
      className="border-border absolute top-8 left-6 z-50 w-72 rounded-lg border bg-white shadow-lg"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.1,
      }}
    >
      <div className="border-border border-b px-3 py-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Comment</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isResolved ? 'secondary' : 'ghost'}
              onClick={onToggleResolved}
              title={isResolved ? 'Reopen comment' : 'Mark as resolved'}
              aria-label={isResolved ? 'Reopen comment' : 'Mark as resolved'}
              className={cn(
                'h-6 px-2 text-xs font-medium',
                isResolved && 'text-green-700'
              )}
            >
              <CheckIcon className="size-3" />
              <span className="ml-1">
                {isResolved ? 'Resolved' : 'Resolve'}
              </span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              title="Deselect comment"
              aria-label="Deselect comment"
              className="h-6 w-6 p-0"
            >
              <XIcon className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      <div
        onWheelCapture={(e) => e.stopPropagation()}
        className="max-h-96 overflow-x-hidden overflow-y-auto"
      >
        <div className="divide-border divide-y">
          {comments.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              No comments yet. Start the conversation!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.commentId ?? comment.createdAt ?? comment.text}
                className="p-3"
              >
                <CommentItem
                  comment={comment}
                  allComments={comments}
                  editingCommentId={editingCommentId}
                  editText={editText}
                  user={user}
                  updatingCommentId={updatingCommentId}
                  deletingCommentId={deletingCommentId}
                  onEdit={onEdit}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onDelete={onDelete}
                  onReply={onReplyToAuthor}
                  onEditTextChange={onEditTextChange}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-border border-t px-3 py-2.5">
        <div className="space-y-2">
          {!!replyToName && (
            <div className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-2.5 py-2 text-xs text-gray-600">
              <div className="min-w-0 flex-1 truncate">
                Replying to{' '}
                <span className="font-medium text-gray-800">{replyToName}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isCreating}
                onClick={onCancelReply}
                className="h-7 px-2 text-xs"
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="relative flex min-w-0 flex-1 items-end gap-2">
            <div className="flex-1">
              <InputEditor
                forceFocus
                value={replyText}
                setValue={onReplyTextChange}
                className="break-all"
              />
            </div>

            <Button
              onClick={onReply}
              disabled={!replyText.trim() || isCreating}
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
    </motion.div>
  )
}
