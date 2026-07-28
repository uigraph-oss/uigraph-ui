import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { buildMetaData, SEQUENCE_PARTICIPANT_COLOR } from '@uigraph/sdk'
import { Node, useNodesInitialized } from '@xyflow/react'
import { useState } from 'react'
import {
  LuArrowRight,
  LuGripVertical,
  LuPlus,
  LuTrash2,
  LuX,
} from 'react-icons/lu'
import { toast } from 'sonner'
import * as icons from '../components/icons'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { beautifyDiagram } from '../helpers/beautify-diagram'
import { beautifySequenceDiagram } from '../helpers/beautify-sequence-diagram'
import {
  createMessage,
  createParticipantNode,
  reorientSequenceMessages,
} from '../helpers/sequence-diagram-authoring'
import { getComponentField } from '../hooks/use-component-field'
import { TComponentField } from '../types/component-fields'
import { SidebarLayout } from './sidebar-layout'

function fieldValue(node: Node, componentFieldId: string): string | null {
  const componentFields = node.data?.componentFields as
    (TComponentField | undefined | null)[] | undefined

  return getComponentField<string>(componentFields, { componentFieldId })
}

export function SidebarModeling() {
  const nodesInitialized = useNodesInitialized()

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    reactFlowInstance,
    tempDiagramState,
  } = useFlowDiagramContext()

  const [isMessageFormOpen, setIsMessageFormOpen] = useState(false)
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [label, setLabel] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [dragging, setDragging] = useState<{
    list: 'participants' | 'messages'
    index: number
  } | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const isLocked = tempDiagramState !== null

  const participants = nodes
    .filter((n) => n.type === 'sequenceParticipant')
    .sort((a, b) => a.position.x - b.position.x)

  const messageLinks = new Map<string, { from?: string; to?: string }>()
  for (const edge of edges) {
    if (
      edge.source.startsWith('participant-') &&
      edge.target.startsWith('message-')
    ) {
      messageLinks.set(edge.target, {
        ...messageLinks.get(edge.target),
        from: edge.source,
      })
    }
    if (
      edge.source.startsWith('message-') &&
      edge.target.startsWith('participant-')
    ) {
      messageLinks.set(edge.source, {
        ...messageLinks.get(edge.source),
        to: edge.target,
      })
    }
  }

  const messages = nodes
    .filter((n) => n.id.startsWith('message-'))
    .sort((a, b) => a.position.y - b.position.y)

  const isSequenceDiagram = participants.length > 0
  const isEmptyCanvas = nodes.length === 0
  const canAuthorSequence = !isLocked && (isSequenceDiagram || isEmptyCanvas)

  function participantName(participant: Node): string {
    const name = fieldValue(participant, 'name')
    if (name) return name

    const index = participants.findIndex((p) => p.id === participant.id)
    return `Participant ${index + 1}`
  }

  function focusNode(nodeId: string) {
    setNodes((prev) => prev.map((n) => ({ ...n, selected: n.id === nodeId })))
    void reactFlowInstance?.fitView({
      nodes: [{ id: nodeId }],
      padding: 3,
      maxZoom: 1.2,
      duration: 300,
    })
  }

  function startRename(nodeId: string, currentName: string) {
    setRenamingId(nodeId)
    setRenameValue(currentName)
  }

  function commitRename() {
    if (!renamingId) return

    const id = renamingId
    const value = renameValue.trim()
    setRenamingId(null)

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n

        const componentFields = (n.data?.componentFields ??
          []) as TComponentField[]

        return {
          ...n,
          data: {
            ...n.data,
            componentFields: buildMetaData(componentFields, { name: value }),
          },
        }
      })
    )
  }

  function handleAddParticipant() {
    const newParticipants: Node[] = []

    if (nodes.length === 0) {
      const first = createParticipantNode(nodes, 'Participant A')
      newParticipants.push(
        first,
        createParticipantNode([first], 'Participant B')
      )
    } else {
      newParticipants.push(createParticipantNode(nodes, 'New Participant'))
    }

    const { nodes: beautified, edges: beautifiedEdges } =
      beautifySequenceDiagram([...nodes, ...newParticipants], edges)
    setNodes(beautified)
    setEdges(beautifiedEdges)
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 50)
  }

  function handleReorderParticipants(fromIndex: number, toIndex: number) {
    const reordered = [...participants]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved)

    const columnX = participants.map((p) => p.position.x)
    const xById = new Map(reordered.map((p, i) => [p.id, columnX[i]]))

    const movedNodes = nodes.map((n) => {
      const x = xById.get(n.id)
      if (x === undefined) return n
      return { ...n, position: { ...n.position, x } }
    })

    const { nodes: beautified, edges: beautifiedEdges } =
      beautifySequenceDiagram(
        movedNodes,
        reorientSequenceMessages(movedNodes, edges)
      )
    setNodes(beautified)
    setEdges(beautifiedEdges)
  }

  function handleDeleteParticipant(participantId: string) {
    const removedMessageIds = new Set(
      [...messageLinks]
        .filter(
          ([, link]) => link.from === participantId || link.to === participantId
        )
        .map(([messageId]) => messageId)
    )

    const remainingNodes = nodes.filter(
      (n) => n.id !== participantId && !removedMessageIds.has(n.id)
    )
    const remainingEdges = edges.filter(
      (e) =>
        e.source !== participantId &&
        e.target !== participantId &&
        !removedMessageIds.has(e.source) &&
        !removedMessageIds.has(e.target)
    )

    const { nodes: beautified, edges: beautifiedEdges } =
      beautifySequenceDiagram(remainingNodes, remainingEdges)
    setNodes(beautified)
    setEdges(beautifiedEdges)
  }

  function handleToggleMessageForm() {
    if (isMessageFormOpen) {
      setIsMessageFormOpen(false)
      return
    }

    setFromId(participants[0]?.id ?? '')
    setToId(participants[1]?.id ?? participants[0]?.id ?? '')
    setLabel('')
    setIsMessageFormOpen(true)
  }

  function handleAddMessage() {
    if (!fromId || !toId) return

    const { nodes: updated, edges: updatedEdges } = createMessage(
      nodes,
      edges,
      fromId,
      toId,
      label
    )
    setNodes(updated)
    setEdges(updatedEdges)
    setLabel('')
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 50)
  }

  function handleReorderMessages(fromIndex: number, toIndex: number) {
    const reordered = [...messages]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved)

    const rowY = messages.map((m) => m.position.y)
    const yById = new Map(reordered.map((m, i) => [m.id, rowY[i]]))

    const movedNodes = nodes.map((n) => {
      const y = yById.get(n.id)
      if (y === undefined) return n
      return { ...n, position: { ...n.position, y } }
    })

    const { nodes: beautified, edges: beautifiedEdges } =
      beautifySequenceDiagram(movedNodes, edges)
    setNodes(beautified)
    setEdges(beautifiedEdges)
  }

  function handleDeleteMessage(messageId: string) {
    const remainingNodes = nodes.filter((n) => n.id !== messageId)
    const remainingEdges = edges.filter(
      (e) => e.source !== messageId && e.target !== messageId
    )

    const { nodes: beautified, edges: beautifiedEdges } =
      beautifySequenceDiagram(remainingNodes, remainingEdges)
    setNodes(beautified)
    setEdges(beautifiedEdges)
  }

  function handleRowDragOver(
    event: React.DragEvent,
    list: 'participants' | 'messages',
    index: number
  ) {
    if (dragging === null) return
    if (dragging.list !== list) return

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    const bounds = event.currentTarget.getBoundingClientRect()
    const isBelowMiddle = event.clientY > bounds.top + bounds.height / 2
    setDropIndex(isBelowMiddle ? index + 1 : index)
  }

  function handleRowDrop(list: 'participants' | 'messages') {
    if (dragging === null) return
    if (dragging.list !== list) return
    if (dropIndex === null) return

    if (dropIndex !== dragging.index && dropIndex !== dragging.index + 1) {
      if (list === 'participants') {
        handleReorderParticipants(dragging.index, dropIndex)
      }
      if (list === 'messages') {
        handleReorderMessages(dragging.index, dropIndex)
      }
    }

    setDragging(null)
    setDropIndex(null)
  }

  function handleBeautify() {
    if (!nodesInitialized) {
      toast.info('Diagram is still rendering — try again in a moment')
      return
    }

    const { nodes: beautified, edges: beautifiedEdges } = beautifyDiagram(
      nodes,
      edges,
      'LR'
    )
    setNodes(beautified)
    setEdges(beautifiedEdges)
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 50)
  }

  return (
    <SidebarLayout className="left-18">
      <div className="flex w-[16rem] flex-col p-1.5">
        <div className="flex h-8 items-center justify-between gap-2 pr-1 pl-2">
          <span className={'text-[0.8125rem] font-medium text-[#828DA3]'}>
            Participants
            {isSequenceDiagram && (
              <span className="ml-1.5 text-[#5A6478]">
                {participants.length}
              </span>
            )}
          </span>

          {isSequenceDiagram && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={!canAuthorSequence}
                  onClick={handleAddParticipant}
                  className={
                    'flex size-6 shrink-0 items-center justify-center rounded-[0.375rem] text-[#828DA3] transition-colors hover:bg-[#2A3242] hover:text-[#F4F7FC] disabled:pointer-events-none disabled:opacity-30'
                  }
                >
                  <LuPlus className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Add participant</TooltipContent>
            </Tooltip>
          )}
        </div>

        {!isSequenceDiagram && (
          <>
            <button
              type="button"
              disabled={!canAuthorSequence}
              onClick={handleAddParticipant}
              className="hover:border-primary/40 flex h-9 w-full items-center gap-2 rounded-[0.5rem] border border-dashed border-[#2A3242] px-2 text-sm text-[#F4F7FC] transition-colors hover:bg-[#1E2533] disabled:pointer-events-none disabled:opacity-40"
            >
              <LuPlus className="size-4 text-[#828DA3]" />
              New sequence diagram
            </button>

            {!isEmptyCanvas && (
              <p className="px-2 pt-2 text-[0.6875rem] leading-relaxed text-[#828DA3]">
                Sequence tools need an empty canvas, or a diagram that already
                has participants.
              </p>
            )}
          </>
        )}

        {participants.map((participant, index) => (
          <div
            key={participant.id}
            draggable={!isLocked && renamingId !== participant.id}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              setDragging({ list: 'participants', index })
            }}
            onDragOver={(event) =>
              handleRowDragOver(event, 'participants', index)
            }
            onDrop={() => handleRowDrop('participants')}
            onDragEnd={() => {
              setDragging(null)
              setDropIndex(null)
            }}
            className={cn(
              'group relative flex h-8 items-center gap-2 rounded-[0.5rem] pr-1 pl-2 transition-colors hover:bg-[#1E2533]',
              participant.selected && 'bg-[#1E2533]',
              dragging?.list === 'participants' &&
                dragging.index === index &&
                'opacity-40'
            )}
          >
            {dragging?.list === 'participants' && dropIndex === index && (
              <span className="bg-primary pointer-events-none absolute inset-x-0 -top-px h-0.5" />
            )}

            {dragging?.list === 'participants' && dropIndex === index + 1 && (
              <span className="bg-primary pointer-events-none absolute inset-x-0 -bottom-px h-0.5" />
            )}

            <span className="relative flex size-3.5 shrink-0 items-center justify-center">
              <span
                className="size-2 rounded-full transition-opacity group-hover:opacity-0"
                style={{
                  background:
                    fieldValue(participant, 'color') ??
                    SEQUENCE_PARTICIPANT_COLOR,
                }}
              />
              <LuGripVertical className="absolute size-3.5 cursor-grab text-[#828DA3] opacity-0 transition-opacity group-hover:opacity-100" />
            </span>

            {renamingId === participant.id ? (
              <Input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') setRenamingId(null)
                }}
                className="h-6 border-[#2A3242] bg-transparent px-1.5 text-[0.8125rem] text-[#F4F7FC] shadow-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => focusNode(participant.id)}
                onDoubleClick={() =>
                  startRename(participant.id, participantName(participant))
                }
                className="flex-1 truncate text-left text-[0.8125rem] text-[#F4F7FC]"
              >
                {participantName(participant)}
              </button>
            )}

            <div
              className={
                'flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'
              }
            >
              <button
                type="button"
                disabled={isLocked}
                onClick={() => handleDeleteParticipant(participant.id)}
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-[0.375rem] text-[#828DA3] transition-colors hover:bg-[#2A3242] hover:text-[#F4F7FC] disabled:pointer-events-none disabled:opacity-30',
                  'hover:text-red-400'
                )}
              >
                <LuTrash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        {isSequenceDiagram && (
          <>
            <div className="mt-2 flex h-8 items-center justify-between gap-2 pr-1 pl-2">
              <span className={'text-[0.8125rem] font-medium text-[#828DA3]'}>
                Messages
                <span className="ml-1.5 text-[#5A6478]">{messages.length}</span>
              </span>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={handleToggleMessageForm}
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-[0.375rem] text-[#828DA3] transition-colors hover:bg-[#2A3242] hover:text-[#F4F7FC] disabled:pointer-events-none disabled:opacity-30',
                      isMessageFormOpen && 'bg-[#2A3242] text-[#F4F7FC]'
                    )}
                  >
                    {isMessageFormOpen ? (
                      <LuX className="size-3.5" />
                    ) : (
                      <LuPlus className="size-3.5" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isMessageFormOpen ? 'Cancel' : 'Add message'}
                </TooltipContent>
              </Tooltip>
            </div>

            {isMessageFormOpen && (
              <div className="mb-1 flex flex-col gap-2 rounded-[0.5rem] border border-[#2A3242] p-2">
                <div className="flex items-center gap-1.5">
                  <Select value={fromId} onValueChange={setFromId}>
                    <SelectTrigger
                      className={
                        'h-8 w-full min-w-0 border-[#2A3242] bg-transparent text-xs text-[#F4F7FC] shadow-none placeholder:text-[#828DA3]'
                      }
                    >
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {participantName(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <LuArrowRight className="size-3.5 shrink-0 text-[#828DA3]" />

                  <Select value={toId} onValueChange={setToId}>
                    <SelectTrigger
                      className={
                        'h-8 w-full min-w-0 border-[#2A3242] bg-transparent text-xs text-[#F4F7FC] shadow-none placeholder:text-[#828DA3]'
                      }
                    >
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {participantName(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Message label"
                  className={
                    'h-8 w-full min-w-0 border-[#2A3242] bg-transparent text-xs text-[#F4F7FC] shadow-none placeholder:text-[#828DA3]'
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMessage()
                  }}
                />

                <Button
                  className="h-8 w-full text-xs"
                  disabled={!fromId || !toId}
                  onClick={handleAddMessage}
                >
                  Add message
                </Button>
              </div>
            )}

            {messages.length === 0 && !isMessageFormOpen && (
              <p className="px-2 pb-1 text-[0.6875rem] text-[#828DA3]">
                No messages yet.
              </p>
            )}

            {messages.map((message, index) => {
              const link = messageLinks.get(message.id)
              const from = participants.find((p) => p.id === link?.from)
              const to = participants.find((p) => p.id === link?.to)
              const messageLabel = fieldValue(message, 'name')

              return (
                <div
                  key={message.id}
                  draggable={!isLocked && renamingId !== message.id}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move'
                    setDragging({ list: 'messages', index })
                  }}
                  onDragOver={(event) =>
                    handleRowDragOver(event, 'messages', index)
                  }
                  onDrop={() => handleRowDrop('messages')}
                  onDragEnd={() => {
                    setDragging(null)
                    setDropIndex(null)
                  }}
                  className={cn(
                    'group relative flex min-h-8 items-center gap-2 rounded-[0.5rem] py-1 pr-1 pl-2 transition-colors hover:bg-[#1E2533]',
                    message.selected && 'bg-[#1E2533]',
                    dragging?.list === 'messages' &&
                      dragging.index === index &&
                      'opacity-40'
                  )}
                >
                  {dragging?.list === 'messages' && dropIndex === index && (
                    <span className="bg-primary pointer-events-none absolute inset-x-0 -top-px h-0.5" />
                  )}

                  {dragging?.list === 'messages' && dropIndex === index + 1 && (
                    <span className="bg-primary pointer-events-none absolute inset-x-0 -bottom-px h-0.5" />
                  )}

                  <span className="relative flex w-3 shrink-0 items-center justify-center">
                    <span className="text-[0.6875rem] text-[#5A6478] transition-opacity group-hover:opacity-0">
                      {index + 1}
                    </span>
                    <LuGripVertical className="absolute size-3.5 cursor-grab text-[#828DA3] opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>

                  <button
                    type="button"
                    onClick={() => focusNode(message.id)}
                    onDoubleClick={() =>
                      startRename(message.id, messageLabel ?? '')
                    }
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
                  >
                    {renamingId === message.id ? null : (
                      <>
                        <span className="flex w-full min-w-0 items-center gap-1 text-[0.8125rem] text-[#F4F7FC]">
                          <span className="truncate">
                            {from ? participantName(from) : 'Unknown'}
                          </span>
                          <LuArrowRight className="size-3 shrink-0 text-[#828DA3]" />
                          <span className="truncate">
                            {to ? participantName(to) : 'Unknown'}
                          </span>
                        </span>

                        {messageLabel && (
                          <span className="w-full truncate text-[0.6875rem] text-[#828DA3]">
                            {messageLabel}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {renamingId === message.id && (
                    <Input
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename()
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      className="h-6 border-[#2A3242] bg-transparent px-1.5 text-[0.8125rem] text-[#F4F7FC] shadow-none"
                    />
                  )}

                  <div
                    className={
                      'flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'
                    }
                  >
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleDeleteMessage(message.id)}
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-[0.375rem] text-[#828DA3] transition-colors hover:bg-[#2A3242] hover:text-[#F4F7FC] disabled:pointer-events-none disabled:opacity-30',
                        'hover:text-red-400'
                      )}
                    >
                      <LuTrash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        <div className="my-1.5 h-px bg-[#2A3242]" />

        <button
          type="button"
          disabled={isLocked || !nodesInitialized || nodes.length === 0}
          onClick={handleBeautify}
          className="flex h-8 w-full items-center gap-2.5 rounded-[0.5rem] px-2 text-left text-[0.8125rem] text-[#F4F7FC] transition-colors hover:bg-[#1E2533] disabled:pointer-events-none disabled:opacity-40 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-[#828DA3]"
        >
          <icons.BeautifyIcon />
          Beautify layout
        </button>
      </div>
    </SidebarLayout>
  )
}
