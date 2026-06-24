import { GT } from '@/api'
import { SuperCircleLoader } from '@/components/loader'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import { useTimeDistanceFromNow } from '@/hooks/use-time-distance-from-now'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useCustomComponentsContext } from './context/custom-components-context'

export function ComponentsGrid() {
  const { customComponents, loadingComponents } = useCustomComponentsContext()

  if (loadingComponents) return <SectionLoader />

  if (customComponents.length === 0) {
    return <SectionNotFound label="No components available" />
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
    >
      {customComponents.map((component) => (
        <ComponentCard key={component.componentId} component={component} />
      ))}
    </div>
  )
}

function ComponentCard({
  component,
}: {
  component: GT.Component & { updatedAt?: string | null }
}) {
  const createdAtFormatted = useTimeDistanceFromNow(component.updatedAt!, {
    addSuffix: true,
    includeSeconds: true,
  })

  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteCustomComponent } = useCustomComponentsContext()

  const fieldsLength = component.componentFields?.length || 0

  return (
    <div className={cn('group relative', !isDeleting && 'magic-shadow')}>
      <Link
        to={`/dashboard/catalog/?component=${component.componentId}`}
        className={cn(
          'border-stock flex h-[7.1875rem] flex-col justify-between rounded-2xl border bg-[#141925] p-4 transition-all',
          isDeleting && 'pointer-events-none opacity-80',
          !isDeleting && 'group-hover:border-primary'
        )}
      >
        <div>
          <h3 className="mb-2 text-sm leading-[1.333]">{component.name}</h3>
          <p className="text-paragraph line-clamp-1 text-sm">
            {component.description}
          </p>
        </div>

        <div className="text-paragraph flex items-center justify-between text-xs leading-[1.333]">
          <p>
            {fieldsLength === 0
              ? 'No Fields'
              : fieldsLength === 1
                ? '1 Field'
                : `${fieldsLength} Fields`}
          </p>

          <p>{createdAtFormatted}</p>
        </div>
      </Link>

      <Button
        size="icon"
        variant="outline"
        disabled={isDeleting}
        className={cn(
          'hover:text-destructive hover:border-destructive absolute top-3 right-3 bg-[#1E2533] opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10',
          isDeleting && 'opacity-100'
        )}
        onClick={async () => {
          setIsDeleting(true)

          try {
            await deleteCustomComponent(component.componentId!)
            toast.success('Component deleted successfully')
          } catch {
            toast.error('Failed to delete component')
          }

          setIsDeleting(false)
        }}
      >
        {isDeleting ? <SuperCircleLoader /> : <Trash2 />}
      </Button>
    </div>
  )
}
