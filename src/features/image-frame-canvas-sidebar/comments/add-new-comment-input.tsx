import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { InputEditor } from '@/features/comments/components/input-editor'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { useCommentsContext } from '../../comments/contexts/comments-context'

export function AddNewCommentInput() {
  const { comments, createComment, replyToCommentId, setReplyToCommentId } =
    useCommentsContext()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentValue, setCommentValue] = useState('')

  const isSubmitDisabled = !commentValue.trim()

  const replyToComment = comments.find(
    (c) => c.commentId && c.commentId === replyToCommentId
  )
  const replyToName = replyToComment?.authorName

  async function handleFormSubmit() {
    const normalizedComment = commentValue.trim()
    if (!normalizedComment) return

    setIsSubmitting(true)
    try {
      await createComment({
        text: normalizedComment,
        parentCommentId: replyToCommentId ?? undefined,
      })

      setCommentValue('')
      setReplyToCommentId(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      {!!replyToCommentId && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <div className="min-w-0 flex-1 truncate">
            Replying to{' '}
            <span className="font-medium text-gray-800">
              {replyToName || 'a comment'}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setReplyToCommentId(null)}
          >
            Cancel
          </Button>
        </div>
      )}
      <div className={isSubmitting ? 'opacity-60' : ''}>
        <InputEditor value={commentValue} setValue={setCommentValue} />
      </div>

      <div className="flex items-center justify-end">
        <Button
          type="button"
          preset="primary"
          disabled={isSubmitDisabled || isSubmitting}
          onClick={() => {
            void handleFormSubmit()
          }}
        >
          {isSubmitting ? (
            <SuperCircleLoader className="size-4!" />
          ) : (
            <Send className="size-4!" />
          )}
          Send
        </Button>
      </div>
    </div>
  )
}
