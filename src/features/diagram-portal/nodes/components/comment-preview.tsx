import { GT } from '@/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { InputRenderer } from '@/features/comments/components/input-editor'
import { usePublicAccount } from '@/features/image-frame-canvas-sidebar/hooks/use-public-account'
import { motion } from 'framer-motion'
import { formatTimeAgo } from '../helpers/comment-helpers'

type CommentPreviewProps = {
  comments: GT.Comment[]
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
      className="border-border absolute top-8 left-6 z-50 rounded-lg border bg-white p-3 shadow-lg"
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
        <div className="text-muted-foreground w-max text-xs">
          No comments yet
        </div>
      )}
    </motion.div>
  )
}

function CommentContent({
  comments,
  totalComments,
}: {
  comments: GT.Comment[]
  totalComments: number
}) {
  const { name, avatarSrc } = usePublicAccount(comments[0]?.createdBy)
  const displayName = name || 'Anonymous'

  return (
    <div className="w-64 space-y-2">
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarImage src={avatarSrc || ''} />
          <AvatarFallback className="text-xs">
            {(displayName.charAt(0) || 'A').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-foreground text-xs font-medium">
          {displayName}
        </span>
        <span className="text-muted-foreground text-xs">
          {comments[0]?.createdAt ? formatTimeAgo(comments[0].createdAt) : ''}
        </span>
      </div>
      <div className="text-foreground line-clamp-2 text-xs">
        <InputRenderer value={comments[0]?.text || 'No comments yet'} />
      </div>
      {totalComments > 1 && (
        <div className="text-muted-foreground text-xs">
          +{totalComments - 1} more
        </div>
      )}
    </div>
  )
}
