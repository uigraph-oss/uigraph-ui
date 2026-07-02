'use client'

import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { ServiceComments } from './components/service-comments'
import { ServiceOwnership } from './components/service-ownership'

interface DashboardServicePeopleProps {
  serviceId: string
}

export function DashboardServicePeople({
  serviceId,
}: DashboardServicePeopleProps) {
  const [control, activeTab] = useBetterTabs([
    { id: 'ownership', label: 'Ownership' },
    { id: 'comments', label: 'Comments' },
  ])

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="People & Collaboration"
        description="Manage ownership, team members, and collaborate through comments."
      />

      <DashboardSectionContent noPadding>
        <div className="flex h-full flex-col">
          <div className="p-6 pb-0">
            <BetterTabController control={control} />

            {activeTab === 'ownership' && (
              <div className="mt-6 flex-1">
                <ServiceOwnership serviceId={serviceId} />
              </div>
            )}
            {activeTab === 'comments' && (
              <div className="mt-6 flex-1">
                <ServiceComments serviceId={serviceId} />
              </div>
            )}
          </div>
        </div>
      </DashboardSectionContent>
    </div>
  )
}
