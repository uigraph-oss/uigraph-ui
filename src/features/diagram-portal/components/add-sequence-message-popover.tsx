import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Node } from '@xyflow/react'
import { ReactNode, useState } from 'react'
import { getComponentField } from '../hooks/use-component-field'
import { TComponentField } from '../types/component-fields'

type AddSequenceMessagePopoverProps = {
  participants: Node[]
  onSubmit: (
    fromParticipantId: string,
    toParticipantId: string,
    label: string
  ) => void
  children: ReactNode
}

function participantName(participant: Node, index: number): string {
  const componentFields = participant.data?.componentFields as
    (TComponentField | undefined | null)[] | undefined
  const name = getComponentField<string>(componentFields, {
    componentFieldId: 'name',
  })
  return name || `Participant ${index + 1}`
}

export function AddSequenceMessagePopover({
  participants,
  onSubmit,
  children,
}: AddSequenceMessagePopoverProps) {
  const [open, setOpen] = useState(false)
  const [fromId, setFromId] = useState(participants[0]?.id ?? '')
  const [toId, setToId] = useState(
    participants[1]?.id ?? participants[0]?.id ?? ''
  )
  const [label, setLabel] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setFromId(participants[0]?.id ?? '')
      setToId(participants[1]?.id ?? participants[0]?.id ?? '')
      setLabel('')
    }
  }

  function handleSubmit() {
    if (!fromId || !toId) return
    onSubmit(fromId, toId, label)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent align="center" className="w-80 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="add-message-from">From</Label>
          <Select value={fromId} onValueChange={setFromId}>
            <SelectTrigger id="add-message-from" className="w-full">
              <SelectValue placeholder="Select participant" />
            </SelectTrigger>
            <SelectContent>
              {participants.map((p, i) => (
                <SelectItem key={p.id} value={p.id}>
                  {participantName(p, i)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="add-message-to">To</Label>
          <Select value={toId} onValueChange={setToId}>
            <SelectTrigger id="add-message-to" className="w-full">
              <SelectValue placeholder="Select participant" />
            </SelectTrigger>
            <SelectContent>
              {participants.map((p, i) => (
                <SelectItem key={p.id} value={p.id}>
                  {participantName(p, i)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="add-message-label">Label</Label>
          <Input
            id="add-message-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. GET /v1/stores"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
            }}
          />
        </div>

        <Button
          className="w-full"
          disabled={!fromId || !toId}
          onClick={handleSubmit}
        >
          Add message
        </Button>
      </PopoverContent>
    </Popover>
  )
}
