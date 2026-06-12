import { useOrganizationContext } from '@/contexts'
import { useAuth } from '@/contexts/auth-context-provider'
import {
  CommentsContextProvider,
  useCommentsContext,
} from '@/features/comments/contexts/comments-context'
import { cn } from '@/lib/utils'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CommentPanel } from './components/comment-panel'
import { CommentPreview } from './components/comment-preview'
import { NodeDataGenerator } from './types/node.types'

export type CommentNodeData = NodeDataGenerator<{
  isResolved?: boolean
}>

export type TCommentNode = Node<CommentNodeData, 'comment'>

export function CommentNode({ ...props }: NodeProps<TCommentNode>) {
  return (
    <CommentsContextProvider resourceId={props.id}>
      <CommentNodeContent {...props} />
    </CommentsContextProvider>
  )
}

function CommentNodeContent({ ...props }: NodeProps<TCommentNode>) {
  const { id, data, selected, dragging } = props
  const { updateNodeData, setNodes } = useReactFlow()
  const { user } = useAuth()
  const { organizationId } = useOrganizationContext()
  const { comments, resourceId, createComment, updateComment, deleteComment } =
    useCommentsContext()

  const [isResolved, setIsResolved] = useState(data?.isResolved || false)
  const [showPanel, setShowPanel] = useState(selected)
  const [isHovered, setIsHovered] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyToName, setReplyToName] = useState<string | null>(null)
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(
    null
  )
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  )

  function updateData(newData: Partial<CommentNodeData>) {
    updateNodeData(id, newData)
  }

  async function addComment(content: string) {
    const normalized = content.trim()
    if (!normalized || !user?.userId || !organizationId) return

    await createComment({
      variables: {
        input: {
          resourceId,
          organizationId,
          text: normalized,
          ...(replyToCommentId ? { parentCommentId: replyToCommentId } : {}),
        },
      },
    })

    setReplyText('')
  }

  async function editComment(commentId: string, newContent: string) {
    const normalized = newContent.trim()
    if (!normalized) return

    await updateComment({
      variables: {
        commentId,
        input: { text: normalized },
      },
    })

    setEditingCommentId(null)
    setEditText('')
  }

  async function deleteCommentById(commentId: string) {
    await deleteComment({ variables: { commentId } })
  }

  function toggleResolved() {
    const newResolved = !isResolved
    setIsResolved(newResolved)
    updateData({ isResolved: newResolved })
  }

  async function handleReply() {
    if (!replyText.trim() || isCreating) return
    setIsCreating(true)
    try {
      await addComment(replyText)
    } finally {
      setIsCreating(false)
      setReplyToName(null)
      setReplyToCommentId(null)
    }
  }

  function handleReplyToAuthor(commentId: string, authorName: string) {
    setReplyToName(authorName)
    setReplyToCommentId(commentId)
    setReplyText(`@${authorName} `)
  }

  function handleCancelReply() {
    setReplyToName(null)
    setReplyToCommentId(null)
    setReplyText('')
  }

  function handleEdit(commentId: string, currentContent: string) {
    setEditingCommentId(commentId)
    setEditText(currentContent)
  }

  async function handleSaveEdit() {
    if (!editingCommentId || !editText.trim() || updatingCommentId) return
    setUpdatingCommentId(editingCommentId)
    try {
      await editComment(editingCommentId, editText)
    } finally {
      setUpdatingCommentId(null)
    }
  }

  function handleCancelEdit() {
    setEditingCommentId(null)
    setEditText('')
  }

  function handleEditTextChange(text: string) {
    setEditText(text)
  }

  async function handleDelete(commentId: string) {
    if (deletingCommentId) return
    setDeletingCommentId(commentId)
    try {
      await deleteCommentById(commentId)
    } finally {
      setDeletingCommentId(null)
    }
  }

  useEffect(() => {
    setShowPanel(selected)
  }, [selected])

  return (
    <div
      className="pointer-events-auto relative isolate"
      style={{ transform: `scale(calc(1 / (var(--react-flow-scale))))` }}
    >
      <motion.div
        className={cn(
          'flex size-8 cursor-pointer items-center justify-center rounded-full',
          isResolved
            ? 'border-2 border-green-500 bg-green-100'
            : 'border-2 border-blue-500 bg-blue-100'
        )}
        onClick={() => setShowPanel(!showPanel)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <motion.div
          className={cn(
            'size-2.5 rounded-full',
            isResolved ? 'bg-green-600' : 'bg-blue-600'
          )}
          animate={{
            scale: selected ? 1.2 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        />
      </motion.div>

      <AnimatePresence>
        {comments.length > 0 && (
          <motion.div
            className="pointer-events-none absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {comments.length}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHovered && !selected && !dragging && (
          <CommentPreview
            comments={comments}
            totalComments={comments.length}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && !dragging && (
          <CommentPanel
            comments={comments}
            isResolved={isResolved}
            user={user}
            replyText={replyText}
            replyToName={replyToName}
            editingCommentId={editingCommentId}
            editText={editText}
            isCreating={isCreating}
            updatingCommentId={updatingCommentId}
            deletingCommentId={deletingCommentId}
            onToggleResolved={toggleResolved}
            onClose={() => {
              setShowPanel(false)
              setNodes((nodes) =>
                nodes.map((n) => (n.id === id ? { ...n, selected: false } : n))
              )
            }}
            onReplyTextChange={setReplyText}
            onReply={handleReply}
            onCancelReply={handleCancelReply}
            onEdit={handleEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onDelete={handleDelete}
            onReplyToAuthor={handleReplyToAuthor}
            onEditTextChange={handleEditTextChange}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
