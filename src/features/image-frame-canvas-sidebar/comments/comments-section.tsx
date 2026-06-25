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
        <MessageCircle className="text-paragraph h-5 w-5" />

        <h3 className="text-lg font-semibold text-[#F4F7FC]">Comments</h3>

        <Badge
          variant="secondary"
          className="bg-primary/20 text-primary text-xs"
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
          <div className="text-paragraph py-8 text-center">
            <MessageCircle className="text-paragraph/40 mx-auto mb-3 h-12 w-12" />
            <p className="text-sm">No comments yet</p>
            <p className="text-paragraph mt-1 text-xs">
              Start the conversation by adding a comment below
            </p>
          </div>
        )}
      </div>

      <AddNewCommentInput />
    </div>
  )
}
