'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrganizationContext } from '@/contexts'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDashboardServicesList } from '../../hooks/use-dashboard-services'
import { ConfigureServiceModal } from './configure-service-modal'
import { ServiceCard } from './service-card'

export function DashboardServices() {
  const [createServiceOpen, setCreateServiceOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { organizationId } = useOrganizationContext()

  const {
    services,
    allServices,
    isServicesLoading,
    statsByServiceId,
    isStatsLoading,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    createService,
    updateService,
    deleteService,
  } = useDashboardServicesList()

  // Normalize categories case-insensitively so "Backend" and "backend" merge
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of services) {
      if (s.category) {
        const key = s.category.toLowerCase()
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(
        ([key, count]) =>
          [key.charAt(0).toUpperCase() + key.slice(1), count] as [
            string,
            number,
          ]
      )
  }, [services])

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        !activeCategory ||
        s.category?.toLowerCase() === activeCategory.toLowerCase()
      return matchesSearch && matchesCategory
    })
  }, [services, searchQuery, activeCategory])

  return (
    <DashboardPageSectionLayout
      title="Service Catalog"
      description="A shared view of your backend services, flows, APIs, data and dependencies"
      crumbs={[{ to: '/services', label: 'Services' }]}
      headerContent={
        <Button preset="primary" onClick={() => setCreateServiceOpen(true)}>
          <CirclePlus />
          Create Service
        </Button>
      }
    >
      {isServicesLoading ? (
        <SectionLoader label="Loading services..." />
      ) : allServices.length === 0 ? (
        <SectionNotFound label="No services yet." />
      ) : (
        <>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="h-8 w-52 rounded-lg border-[#E2E8F0] bg-white text-[13px] shadow-none focus-visible:bg-white"
            />

            {teams.length > 0 && (
              <Select
                value={selectedTeamId ?? '__all__'}
                onValueChange={(v) =>
                  setSelectedTeamId(v === '__all__' ? null : v)
                }
              >
                <SelectTrigger className="h-8 w-40 shrink-0 rounded-lg border-[#E2E8F0] bg-white text-[13px] shadow-none">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Teams</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.teamId ?? ''} value={t.teamId ?? ''}>
                      {t.teamName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-0.5 rounded-lg bg-[#F8FAFC] p-0.5 ring-1 ring-[#E2E8F0]">
              <FilterPill
                label="All"
                count={services.length}
                active={activeCategory === null}
                onClick={() => setActiveCategory(null)}
              />
              {categories.map(([cat, count]) => (
                <FilterPill
                  key={cat}
                  label={cat}
                  count={count}
                  active={activeCategory === cat}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat ? null : cat)
                  }
                />
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <SectionNotFound label="No services match your search." />
          ) : (
            <div
              className="grid grid-cols-1 gap-4 pb-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              }}
            >
              {filtered.map((service, index) => (
                <ServiceCard
                  key={service.serviceId}
                  service={service}
                  index={index}
                  stats={
                    service.serviceId
                      ? statsByServiceId.get(service.serviceId)
                      : undefined
                  }
                  statsLoading={isStatsLoading}
                  updateService={(data) =>
                    updateService({
                      variables: { serviceId: service.serviceId!, input: data },
                    })
                  }
                  deleteService={() =>
                    deleteService({
                      variables: {
                        serviceId: service.serviceId!,
                        organizationId: service.organizationId!,
                      },
                    })
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      <BetterDialogProvider
        open={createServiceOpen}
        onOpenChange={setCreateServiceOpen}
      >
        <ConfigureServiceModal
          mode="create"
          onSubmit={async (data) => {
            await createService({
              variables: { input: { ...data, organizationId } },
            })
            toast.success('Service created successfully')
            setCreateServiceOpen(false)
          }}
        />
      </BetterDialogProvider>
    </DashboardPageSectionLayout>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-all duration-150',
        active
          ? 'bg-[#0F172A] text-white'
          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
      )}
    >
      {label}
      <span
        className={cn(
          'rounded px-1 py-px text-[10px] font-semibold tabular-nums',
          active ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#64748B]'
        )}
      >
        {count}
      </span>
    </button>
  )
}
