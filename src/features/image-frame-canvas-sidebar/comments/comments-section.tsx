'use client'

import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'
import { useCommentsContext } from '../../comments/contexts/comments-context'
import { AddNewCommentInput } from './add-new-comment-input'
import { CommentItem } from './comment-item'

export function CommentsSection() {
  const { comments, isLoading } = useCommentsContext()

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-gray-600" />

        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>

        <Badge
          variant="secondary"
          className="bg-gray-100 text-xs text-gray-600"
        >
          {comments.length || 0}
        </Badge>
      </div>

      <div className="mb-4">
        {isLoading ? (
          <SectionLoader />
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.commentId ?? comment.createdAt ?? comment.text}
                comment={comment}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm">No comments yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Start the conversation by adding a comment below
            </p>
          </div>
        )}
      </div>

      <AddNewCommentInput />
    </div>
  )
}
