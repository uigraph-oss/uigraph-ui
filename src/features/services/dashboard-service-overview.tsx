'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { toUpdateServiceInput } from '@/features/services/api/services-v2'
import { useCurrentOrganization } from '@/store/auth-store'
import { objectOmitNull } from 'daily-code'
import { useState } from 'react'
import { GoGear } from 'react-icons/go'
import { toast } from 'sonner'
import { ServiceOverview } from './components/service-overview'
import { ConfigureServiceModal } from './components/services-list/configure-service-modal'
import { useServiceContext } from './contexts/service-context'

interface DashboardServiceOverviewProps {
  serviceId: string
}

export function DashboardServiceOverview({
  serviceId,
}: DashboardServiceOverviewProps) {
  const orgId = useCurrentOrganization().id
  const { updateService, service } = useServiceContext()
  const [isUpdateServiceModalOpen, setIsUpdateServiceModalOpen] =
    useState(false)

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Overview"
        description="View service health, deployment status, and key metrics at a glance."
      >
        <Button
          preset="outline"
          onClick={() => setIsUpdateServiceModalOpen(true)}
        >
          <GoGear />
        </Button>
      </DashboardSectionHeader>

      <DashboardSectionContent>
        <ServiceOverview />
      </DashboardSectionContent>

      <BetterDialogProvider
        open={isUpdateServiceModalOpen}
        onOpenChange={setIsUpdateServiceModalOpen}
      >
        <ConfigureServiceModal
          mode="update"
          defaultValues={objectOmitNull({
            ...service,
            name: service.name || '',
            category: service.category || '',
            description: service.description || '',
          })}
          onSubmit={async (data) => {
            await updateService({
              variables: {
                orgId,
                id: serviceId,
                input: toUpdateServiceInput(data),
              },
            })

            toast.success('Service updated successfully')
            setIsUpdateServiceModalOpen(false)
          }}
        />
      </BetterDialogProvider>
    </div>
  )
}
