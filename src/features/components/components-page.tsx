'use client'

import { CirclePlusIcon } from '@/assets/svgs'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DashboardPageSectionLayout } from '../dashboard'
import { ComponentsGrid } from './components-grid'
import { ConfigureComponentModal } from './components/configure-component'
import {
  CustomComponentsContextProvider,
  useCustomComponentsContext,
} from './context/custom-components-context'

function ComponentsPageInner() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    nativeComponents,
    customComponents,
    createCustomComponent,
    updateCustomComponent,
    totalCount,
    pageSize,
    page,
    setPage,
    sortBy,
    setSortBy,
    search,
    setSearch,
  } = useCustomComponentsContext()

  const componentId = searchParams.get('component')
  const selectedComponent = customComponents.find(
    (component) => component.componentId === componentId
  )

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <DashboardPageSectionLayout
      title="Catalog Manager"
      description="Create and manage your application components"
      crumbs={[{ to: '/dashboard/catalog', label: 'Catalog' }]}
      headerContent={
        <Button asChild className="h-11 gap-2 rounded-[0.8125rem]">
          <Link to="/dashboard/catalog?component=new">
            <CirclePlusIcon />
            New Component
          </Link>
        </Button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="h-10 w-52 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none focus-visible:bg-[#1E2533]"
        />

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-10 w-40 shrink-0 rounded-lg border-[#2A3242] bg-[#1E2533] text-[13px] shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ComponentsGrid />

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <FunctionalPagination
            currentPage={page + 1}
            totalPages={totalPages}
            setCurrentPage={(p) => setPage(p - 1)}
          />
        </div>
      )}

      <ConfigureComponentModal
        open={Boolean(componentId || selectedComponent)}
        onOpenChange={() => navigate('/dashboard/catalog')}
        nativeComponents={nativeComponents}
        selectedComponent={selectedComponent ?? null}
        onSubmit={async (name, category, description, fields) => {
          if (selectedComponent) {
            try {
              await updateCustomComponent(
                selectedComponent,
                name,
                category,
                description,
                fields
              )

              void navigate('/dashboard/catalog')
              toast.success('Component updated successfully!')
            } catch {
              toast.error('Error updating component. Please try again later.')
            }
          } else {
            try {
              await createCustomComponent(name, category, description, fields)

              void navigate('/dashboard/catalog')
              toast.success('Component created successfully!')
            } catch {
              toast.error('Error creating component. Please try again later.')
            }
          }
        }}
      />
    </DashboardPageSectionLayout>
  )
}

export function ComponentsPage() {
  return (
    <CustomComponentsContextProvider>
      <ComponentsPageInner />
    </CustomComponentsContextProvider>
  )
}
