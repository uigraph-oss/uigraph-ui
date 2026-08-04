'use client'

import { SectionNotFound } from '@/components/section-not-found'
import { useState } from 'react'
import type { InfraResource } from '../types'
import { ResourceCard } from './resource-card'
import { ResourceDetailDialog } from './resource-detail-dialog'

export function ResourceInventoryGrid({
  resources,
}: {
  resources: InfraResource[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = resources.find((r) => r.id === selectedId) ?? null

  if (resources.length === 0) {
    return <SectionNotFound plain label="No resources match your filters" />
  }

  return (
    <>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onClick={() => setSelectedId(resource.id)}
          />
        ))}
      </div>

      <ResourceDetailDialog
        resource={selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </>
  )
}
