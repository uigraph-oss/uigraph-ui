'use client'

import { CheckIcon, MessageIcon, PlusIcon, UserIcon } from '@/assets/svgs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockComments } from '@/features/services/constants/mock-data'
import { useState } from 'react'
import { ServiceComment } from '../types'

interface ServiceCommentsProps {
  serviceId: string
}

export function ServiceComments({}: ServiceCommentsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedComment, setSelectedComment] = useState<ServiceComment | null>(
    null
  )
  const [newReply, setNewReply] = useState('')

  const filteredComments = mockComments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      filterType === 'all' || comment.targetType === filterType
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'resolved' && comment.resolved) ||
      (filterStatus === 'unresolved' && !comment.resolved)

    return matchesSearch && matchesType && matchesStatus
  })

  function handleResolveComment(commentId: string) {
    // In a real app, this would update the comment status
    console.log('Resolving comment:', commentId)
  }

  function handleAddReply(commentId: string) {
    if (newReply.trim()) {
      // In a real app, this would add a new reply
      console.log('Adding reply to comment:', commentId, newReply)
      setNewReply('')
    }
  }

  function getTargetTypeColor(type: string) {
    switch (type) {
      case 'endpoint':
        return 'bg-blue-100 text-blue-800'
      case 'diagram':
        return 'bg-green-100 text-green-800'
      case 'schema':
        return 'bg-purple-100 text-purple-800'
      case 'job':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusColor(resolved: boolean) {
    return resolved
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Comments List */}
      <div className="flex flex-1 flex-col">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="endpoint">Endpoint</SelectItem>
              <SelectItem value="diagram">Diagram</SelectItem>
              <SelectItem value="schema">Schema</SelectItem>
              <SelectItem value="job">Job</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comments List */}
        <div className="bg-card text-card-foreground flex flex-1 flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="leading-none font-semibold">
                  Comments ({filteredComments.length})
                </h3>
                <p className="text-muted-foreground text-sm">
                  Global threads with filters
                </p>
              </div>
              <Button size="sm" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Comment
              </Button>
            </div>
          </div>
          <div className="p-0 px-0">
            <div className="space-y-0">
              {filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`cursor-pointer border-b border-gray-200 p-4 hover:bg-gray-50 ${
                    selectedComment?.id === comment.id
                      ? 'border-blue-200 bg-blue-50'
                      : ''
                  }`}
                  onClick={() => setSelectedComment(comment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge
                          className={getTargetTypeColor(comment.targetType)}
                        >
                          {comment.targetType}
                        </Badge>
                        <Badge className={getStatusColor(comment.resolved)}>
                          {comment.resolved ? 'Resolved' : 'Unresolved'}
                        </Badge>
                        {comment.replies && comment.replies.length > 0 && (
                          <Badge variant="outline">
                            {comment.replies.length} replies
                          </Badge>
                        )}
                      </div>
                      <p className="mb-2 line-clamp-2 text-sm text-gray-900">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <UserIcon className="h-3 w-3" />
                        <span>{comment.author}</span>
                        <span>•</span>
                        <span>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{comment.targetId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Comment Details */}
      {selectedComment && (
        <div className="w-96 flex-shrink-0">
          <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
              <h3 className="flex items-center gap-2 leading-none font-semibold">
                <MessageIcon className="h-5 w-5" />
                <span>Comment Thread</span>
              </h3>
              <p className="text-muted-foreground text-sm">
                {selectedComment.targetType}: {selectedComment.targetId}
              </p>
            </div>
            <div className="space-y-4 px-6">
              {/* Main Comment */}
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    className={getTargetTypeColor(selectedComment.targetType)}
                  >
                    {selectedComment.targetType}
                  </Badge>
                  <Badge className={getStatusColor(selectedComment.resolved)}>
                    {selectedComment.resolved ? 'Resolved' : 'Unresolved'}
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-gray-900">
                  {selectedComment.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <UserIcon className="h-3 w-3" />
                  <span>{selectedComment.author}</span>
                  <span>•</span>
                  <span>
                    {new Date(selectedComment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Replies */}
              {selectedComment.replies &&
                selectedComment.replies.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Replies</h4>
                    {selectedComment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="border-l-2 border-gray-200 pl-3"
                      >
                        <p className="mb-1 text-sm text-gray-900">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <UserIcon className="h-3 w-3" />
                          <span>{reply.author}</span>
                          <span>•</span>
                          <span>
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Add Reply */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-medium">Add Reply</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Write a reply..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(selectedComment.id)}
                      disabled={!newReply.trim()}
                    >
                      Reply
                    </Button>
                    {!selectedComment.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveComment(selectedComment.id)}
                      >
                        <CheckIcon className="h-4 w-4" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
