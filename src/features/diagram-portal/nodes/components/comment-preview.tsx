import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { UIComment } from '@/features/comments/api/comments'
import { InputRenderer } from '@/features/comments/components/input-editor'
import { motion } from 'framer-motion'
import { formatTimeAgo } from '../helpers/comment-helpers'

type CommentPreviewProps = {
  comments: UIComment[]
  totalComments: number
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function CommentPreview({
  comments,
  totalComments,
  onMouseEnter,
  onMouseLeave,
}: CommentPreviewProps) {
  return (
    <motion.div
      className="absolute top-8 left-6 z-50 rounded-lg border border-[#2A3242] bg-[#141925] p-3 shadow-lg"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        duration: 0.1,
      }}
    >
      {comments.length > 0 ? (
        <CommentContent comments={comments} totalComments={totalComments} />
      ) : (
        <div className="w-max text-xs text-[#828DA3]">No comments yet</div>
      )}
    </motion.div>
  )
}

function CommentContent({
  comments,
  totalComments,
}: {
  comments: UIComment[]
  totalComments: number
}) {
  const avatarSrc = comments[0]?.authorAvatarUrl ?? ''
  const displayName = comments[0]?.authorName || 'Anonymous'

  return (
    <div className="w-64 space-y-2">
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarImage src={avatarSrc || ''} />
          <AvatarFallback className="text-xs">
            {(displayName.charAt(0) || 'A').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium text-[#F4F7FC]">
          {displayName}
        </span>
        <span className="text-xs text-[#828DA3]">
          {comments[0]?.createdAt ? formatTimeAgo(comments[0].createdAt) : ''}
        </span>
      </div>
      <div className="line-clamp-2 text-xs text-[#F4F7FC]">
        <InputRenderer
          theme="dark"
          value={comments[0]?.text || 'No comments yet'}
        />
      </div>
      {totalComments > 1 && (
        <div className="text-xs text-[#828DA3]">+{totalComments - 1} more</div>
      )}
    </div>
  )
}
