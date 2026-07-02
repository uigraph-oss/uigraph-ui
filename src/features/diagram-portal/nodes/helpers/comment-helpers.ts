export function generateCommentId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  )

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  if (diffInMinutes < 1440)
    return `${Math.floor(diffInMinutes / 60)} hour${
      Math.floor(diffInMinutes / 60) > 1 ? 's' : ''
    } ago`
  return `${Math.floor(diffInMinutes / 1440)} day${
    Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''
  } ago`
}

export function calculateTotalComments(comments: Comment[]): number {
  return comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies?.length || 0)
  }, 0)
}

export function updateCommentInTree(
  comments: Comment[],
  commentId: string,
  updater: (comment: Comment) => Comment
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment)
    }
    if (comment.replies) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, commentId, updater),
      }
    }
    return comment
  })
}

export function deleteCommentFromTree(
  comments: Comment[],
  commentId: string
): Comment[] {
  return comments.filter((comment) => {
    if (comment.id === commentId) return false
    if (comment.replies) {
      comment.replies = deleteCommentFromTree(comment.replies, commentId)
    }
    return true
  })
}

export type Comment = {
  id: string
  content: string
  author: {
    name: string
    avatar: string
    userId: string
  }
  createdAt: string
  replies?: Comment[]
}
