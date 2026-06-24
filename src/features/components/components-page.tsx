'use client'

import { CirclePlusIcon } from '@/assets/svgs'
import { Button } from '@/components/ui/button'
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
  } = useCustomComponentsContext()

  const componentId = searchParams.get('component')
  const selectedComponent = customComponents.find(
    (component) => component.componentId === componentId
  )

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
      <ComponentsGrid />

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
