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
import { DashboardPageSectionLayout } from '@/features/dashboard'
import {
  toCreateServiceInput,
  toUpdateServiceInput,
} from '@/features/services/api/services'
import { cn } from '@/lib/utils'
import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDashboardServicesList } from '../../hooks/use-dashboard-services'
import { ConfigureServiceModal } from './configure-service-modal'
import { ServiceCard } from './service-card'

export function DashboardServices() {
  const [createServiceOpen, setCreateServiceOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const {
    orgId,
    services,
    isServicesLoading,
    statsByServiceId,
    isStatsLoading,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    sortBy,
    setSortBy,
    search,
    setSearch,
    createService,
    updateService,
    deleteService,
  } = useDashboardServicesList()

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
    if (!activeCategory) return services
    return services.filter(
      (s) => s.category?.toLowerCase() === activeCategory.toLowerCase()
    )
  }, [services, activeCategory])

  return (
    <DashboardPageSectionLayout
      title="Service Catalog"
      description="A shared view of your backend services, flows, APIs, data and dependencies"
      crumbs={[{ to: '/services', label: 'Services' }]}
      headerContent={
        <Button preset="cta" onClick={() => setCreateServiceOpen(true)}>
          <CirclePlus />
          Create Service
        </Button>
      }
    >
      {isServicesLoading ? (
        <SectionLoader label="Loading services..." />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="h-10 w-52 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none focus-visible:bg-[#1E2533]"
            />

            {teams.length > 0 && (
              <Select
                value={selectedTeamId ?? '__all__'}
                onValueChange={(v) =>
                  setSelectedTeamId(v === '__all__' ? null : v)
                }
              >
                <SelectTrigger className="h-10 w-40 shrink-0 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Teams</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 w-40 shrink-0 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Newest</SelectItem>
                <SelectItem value="updated">Recently updated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-0.5 rounded-lg bg-[#1E2533] p-0.5 ring-1 ring-[#2A3242]">
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
                  key={service.id}
                  service={service}
                  index={index}
                  stats={statsByServiceId.get(service.id)}
                  statsLoading={isStatsLoading}
                  updateService={(data) =>
                    updateService({
                      variables: {
                        orgId: orgId!,
                        id: service.id,
                        input: toUpdateServiceInput(data),
                      },
                    })
                  }
                  deleteService={() =>
                    deleteService({
                      variables: {
                        orgId: orgId!,
                        id: service.id,
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
              variables: {
                orgId: orgId!,
                input: toCreateServiceInput(data),
              },
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
          ? 'bg-[#2A3242] text-[#F4F7FC]'
          : 'text-[#828DA3] hover:bg-[#2A3242]/50 hover:text-[#F4F7FC]'
      )}
    >
      {label}
      <span
        className={cn(
          'rounded px-1 py-px text-[10px] font-semibold tabular-nums',
          active ? 'bg-white/15 text-white' : 'bg-[#141925] text-[#828DA3]'
        )}
      >
        {count}
      </span>
    </button>
  )
}
