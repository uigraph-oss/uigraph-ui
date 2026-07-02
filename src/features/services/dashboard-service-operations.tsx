'use client'

import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { ServiceConfig } from './components/service-config'
import { ServiceJobs } from './components/service-jobs'
import { ServiceRunbooks } from './components/service-runbooks'

interface DashboardServiceOperationsProps {
  serviceId: string
}

export function DashboardServiceOperations({
  serviceId,
}: DashboardServiceOperationsProps) {
  const [control, activeTab] = useBetterTabs([
    { id: 'jobs', label: 'Jobs & Async' },
    { id: 'config', label: 'Config & Environment Variables' },
    { id: 'runbooks', label: 'Runbooks & Playbooks' },
  ])

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Operations"
        description="Monitor jobs, manage configuration, and access runbooks and playbooks."
      />

      <DashboardSectionContent noPadding>
        <div className="flex h-full flex-col">
          <div className="p-6 pb-0">
            <BetterTabController control={control} />

            {activeTab === 'jobs' && (
              <div className="mt-6 flex-1">
                <ServiceJobs serviceId={serviceId} />
              </div>
            )}
            {activeTab === 'config' && (
              <div className="mt-6 flex-1">
                <ServiceConfig serviceId={serviceId} />
              </div>
            )}
            {activeTab === 'runbooks' && (
              <div className="mt-6 flex-1">
                <ServiceRunbooks serviceId={serviceId} />
              </div>
            )}
          </div>
        </div>
      </DashboardSectionContent>
    </div>
  )
}
