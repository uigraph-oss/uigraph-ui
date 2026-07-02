import { format, formatDistanceToNow } from 'date-fns'

export function getUpdatedLabel(updatedAt: string): string {
  return `Updated ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}`
}

export function getMessageTimeLabel(createdAt: string): string {
  return format(new Date(createdAt), 'p')
}
