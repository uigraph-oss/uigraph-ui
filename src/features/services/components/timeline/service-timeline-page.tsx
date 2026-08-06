'use client'

import type { GT } from '@/api'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { usePermissions } from '@/hooks/use-permissions'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useServiceContext } from '../../contexts/service-context'
import {
  CREATE_TIMELINE_EVENT,
  DELETE_TIMELINE_EVENT,
  SERVICE_TIMELINE_EVENTS,
  UPDATE_TIMELINE_EVENT,
} from './api/timeline'
import { filterTimelineEvents } from './lib/filter-events'
import { mapGraphqlTimelineEvent } from './lib/map-graphql-event'
import { TimelineEmptyState } from './timeline-empty-state'
import { TimelineEventDetailDialog } from './timeline-event-detail-dialog'
import { TimelineEventFormDialog } from './timeline-event-form-dialog'
import { TimelineFilterBar } from './timeline-filter-bar'
import { TimelineList } from './timeline-list'
import type { TimelineEvent, TimelinePeriod, TimelineTypeFilter } from './types'

type FormTarget = 'create' | TimelineEvent | null

export function ServiceTimelinePage() {
  const { canWrite } = usePermissions()
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization()?.id as string

  const [type, setType] = useState<TimelineTypeFilter>('all')
  const [period, setPeriod] = useState<TimelinePeriod>('90d')
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [formTarget, setFormTarget] = useState<FormTarget>(null)
  const [deleteTarget, setDeleteTarget] = useState<TimelineEvent | null>(null)

  const query = useQuery(SERVICE_TIMELINE_EVENTS, {
    variables: { orgId, serviceId },
    skip: !orgId || !serviceId,
  })
  const [createEvent] = useMutation(CREATE_TIMELINE_EVENT)
  const [updateEvent] = useMutation(UPDATE_TIMELINE_EVENT)
  const [deleteEvent] = useMutation(DELETE_TIMELINE_EVENT)

  const events = useMemo(
    () =>
      (query.data?.serviceTimelineEvents ?? []).map(mapGraphqlTimelineEvent),
    [query.data]
  )
  const loading = query.loading && !query.data

  const filteredEvents = useMemo(
    () => filterTimelineEvents(events, { type, period, search }),
    [events, type, period, search]
  )

  const isFiltered = type !== 'all' || period !== 'all' || search.trim() !== ''

  async function handleFormSubmit(input: GT.CreateTimelineEventInput) {
    if (formTarget === 'create') {
      await createEvent({ variables: { orgId, serviceId, input } })
    } else if (formTarget) {
      await updateEvent({
        variables: { orgId, serviceId, eventId: formTarget.id, input },
      })
    }
    await query.refetch()
    setFormTarget(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await deleteEvent({
      variables: { orgId, serviceId, eventId: deleteTarget.id },
    })
    await query.refetch()
    setDeleteTarget(null)
  }

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Timeline"
        description="Releases, decisions, and incident postmortems for this service — synced from artifacts already in the repo, or logged by hand — each event links back to the graph nodes it touched."
      >
        <Button
          preset="cta"
          disabled={!canWrite}
          onClick={() => setFormTarget('create')}
        >
          <CirclePlus />
          Add event
        </Button>
      </DashboardSectionHeader>

      <DashboardSectionContent className="gap-4">
        {loading ? (
          <SectionLoader label="Loading timeline..." />
        ) : (
          <>
            <TimelineFilterBar
              type={type}
              period={period}
              search={search}
              onTypeChange={setType}
              onPeriodChange={setPeriod}
              onSearchChange={setSearch}
            />

            <div className="border-stock bg-shading/40 rounded-[12px] border p-6">
              {filteredEvents.length > 0 ? (
                <TimelineList
                  events={filteredEvents}
                  onSelectEvent={setSelectedEvent}
                />
              ) : (
                <TimelineEmptyState filtered={isFiltered} />
              )}
            </div>
          </>
        )}
      </DashboardSectionContent>

      <BetterDialogProvider
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        {selectedEvent ? (
          <TimelineEventDetailDialog
            event={selectedEvent}
            onEdit={() => {
              setFormTarget(selectedEvent)
              setSelectedEvent(null)
            }}
            onDelete={() => {
              setDeleteTarget(selectedEvent)
              setSelectedEvent(null)
            }}
          />
        ) : null}
      </BetterDialogProvider>

      <BetterDialogProvider
        open={!!formTarget}
        onOpenChange={(open) => !open && setFormTarget(null)}
      >
        {formTarget ? (
          <TimelineEventFormDialog
            mode={formTarget === 'create' ? 'create' : 'edit'}
            defaultEvent={formTarget === 'create' ? null : formTarget}
            orgId={orgId}
            onSubmit={handleFormSubmit}
          />
        ) : null}
      </BetterDialogProvider>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete timeline event</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Delete "${deleteTarget.title}"? This can't be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
