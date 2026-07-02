'use client'

import { SimpleModalBase } from '@/components'
import { ActorAvatar } from '@/components/actor-avatar'
import { SuperCircleLoader } from '@/components/loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { format } from 'date-fns'
import { Calendar, MoreVertical, Target } from 'lucide-react'
import { useState } from 'react'
import { LuCloudUpload } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { DashboardFrame } from '../../api'
import { useSingleProject } from '../../contexts/project-context'
import { ConfigurePageModal } from './configure-page-modal'

export function PagesGrid({ pages }: { pages: DashboardFrame[] }) {
  if (pages.length === 0) {
    return <SectionNotFound label="No frames found" />
  }

  return (
    <div
      className="grid gap-6 pb-6"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
    >
      {pages.map((page) => (
        <PageCard key={page.id} page={page} />
      ))}
    </div>
  )
}

function PageCard({ page }: { page: DashboardFrame }) {
  const organizationId = useCurrentOrganization()?.id
  const { mapId, deleteFrame, updateFrame, isFrameDeleting } =
    useSingleProject()

  const [isEditPage, setEditPage] = useState(false)
  const [isDeletePage, setDeletePage] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isPortraitImage, setIsPortraitImage] = useState(true)
  const [imageError, setImageError] = useState(false)

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget
    if (naturalHeight > 0) {
      setIsPortraitImage(naturalWidth / naturalHeight < 1.4)
    }
  }

  return (
    <div className="group relative">
      <Link
        to={`/dashboard/frame/${page.id}`}
        className="relative block cursor-pointer overflow-hidden rounded-[1.4525rem] bg-[#141925] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] ring-1 ring-[#2A3242] transition-all duration-300 hover:shadow-[0_0_0_3px_rgba(1,90,235,0.25),0_8px_24px_rgba(0,0,0,0.4)] hover:ring-2 hover:ring-[#015AEB]"
      >
        {/* Preview area — flush to card edges */}
        <div
          className={cn(
            'relative aspect-[16/10] w-full transition-colors duration-300',
            page.screenshotImageUrl && !imageError
              ? 'bg-[#1E2533] group-hover:bg-[#2A3242]'
              : 'bg-[#1E2533]'
          )}
        >
          {page.screenshotImageUrl && !imageError ? (
            <img
              alt={page.name ?? 'Frame Image'}
              src={page.screenshotImageUrl}
              onLoad={handleImageLoad}
              onError={() => setImageError(true)}
              className={cn(
                'h-full w-full',
                isPortraitImage
                  ? 'object-cover object-top group-hover:object-bottom'
                  : 'object-contain'
              )}
              style={
                isPortraitImage
                  ? { transition: 'object-position 2.5s ease-in-out' }
                  : undefined
              }
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#2A3242]">
                <LuCloudUpload className="size-4 text-[#586378]" />
              </div>
              <span className="text-[11px] font-medium text-[#586378]">
                No preview available
              </span>
            </div>
          )}
          {/* Bottom fade for smooth transition into content */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#141925]/40 to-transparent" />
        </div>

        {/* Thin divider */}
        <div className="h-px bg-[#2A3242]" />

        {/* Content */}
        <div className="px-4 py-3">
          <h4 className="line-clamp-1 text-sm font-semibold text-[#F4F7FC]">
            {page.name ?? (
              <span className="text-[#586378]">Untitled Frame</span>
            )}
          </h4>

          <div className="mt-2 flex min-h-[1.75rem] items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3 text-[#828DA3]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="text-[11px]">
                  {page.createdAt
                    ? format(new Date(page.createdAt), 'dd MMM yyyy')
                    : 'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Target className="h-3 w-3 shrink-0" />
                <span className="text-[11px]">
                  {page.focalPointCount ?? 0} focal points
                </span>
              </div>
            </div>

            <ActorAvatar
              actor={page.updatedByActor ?? page.createdByActor}
              className="shrink-0"
            />
          </div>
        </div>
      </Link>

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'absolute top-2 right-2 h-7 w-7 rounded-lg bg-[#1E2533]/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-[#1E2533]',
              isDropdownOpen && 'opacity-100'
            )}
          >
            <MoreVertical className="h-3.5 w-3.5 text-[#828DA3]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditPage(true)}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            variant={'destructive'}
            onClick={() => setDeletePage(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfigurePageModal
        editMode
        open={isEditPage}
        onOpenChange={setEditPage}
        title="Edit Frame"
        ctaLabel="Save Changes"
        description="Edit the details of the frame."
        submitForm={async (data) => {
          await updateFrame({
            variables: {
              orgId: organizationId!,
              mapId,
              id: page.id,
              input: {
                name: data.name,
                description: data.description,
              },
            },
          })

          setEditPage(false)
        }}
        initialValues={{
          name: page.name ?? '',
          description: page.description ?? '',
        }}
      />

      <SimpleModalBase
        open={isDeletePage}
        onOpenChange={setDeletePage}
        className={'!max-w-md'}
      >
        <DialogHeader className={'p-6'}>
          <DialogTitle>Delete Frame?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this frame? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 p-6 pt-0">
          <Button
            variant="outline"
            className={'h-11'}
            onClick={() => setDeletePage(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            className={'h-11'}
            disabled={isFrameDeleting}
            onClick={async () => {
              await deleteFrame({
                variables: { orgId: organizationId!, mapId, id: page.id },
              })
              setDeletePage(false)
            }}
          >
            {isFrameDeleting && <SuperCircleLoader />}
            Delete
          </Button>
        </div>
      </SimpleModalBase>
    </div>
  )
}
