import { SectionNotFound } from '@/components/section-not-found'
import type { InfraResource } from '../types'
import { ResourceCard } from './resource-card'

export function ResourceInventoryGrid({
  resources,
}: {
  resources: InfraResource[]
}) {
  if (resources.length === 0) {
    return <SectionNotFound plain label="No resources match your filters" />
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
