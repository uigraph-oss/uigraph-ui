'use client'

import { Button } from '@/components/ui/button'
import { ComponentInputType } from '@/features/component-meta'
import { uploadFile } from '@/features/uploads/api/uploads'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { openFileExplorer } from 'daily-code/browser'
import { ImageIcon, Upload } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { CREATE_DIAGRAM_IMAGE, DIAGRAM_IMAGES } from '../api/images'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'

export function SidebarImages() {
  const { diagramId, organizationId } = useFlowDiagramContext()

  const { data, refetch } = useQuery(DIAGRAM_IMAGES, {
    variables: { orgId: organizationId!, diagramId: diagramId! },
    skip: !diagramId || !organizationId,
  })

  const [createDiagramImage, { loading: isUploading }] =
    useMutation(CREATE_DIAGRAM_IMAGE)

  const images = useMemo(() => {
    return arrayNonNullable(data?.diagramImages)
  }, [data?.diagramImages])

  async function handleUploadImage() {
    if (!diagramId || !organizationId) return

    try {
      const [file] = await openFileExplorer({ accept: 'image/*' })
      if (!file) return

      const assetId = await uploadFile(organizationId, file)

      await createDiagramImage({
        variables: {
          orgId: organizationId,
          diagramId,
          input: {
            assetId,
            fileName: file.name,
            order: images.length,
          },
        },
      })

      await refetch()
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  return (
    <SidebarLayout className="left-18">
      <div className="flex w-[10.5rem] flex-col gap-3 p-2">
        <Button
          preset="outline"
          onClick={handleUploadImage}
          disabled={isUploading}
          className="h-9 w-full gap-2 text-sm"
        >
          <Upload className="size-4 shrink-0" />
          {isUploading ? 'Uploading...' : 'Upload image'}
        </Button>

        {images.length > 0 && (
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-medium text-[#828DA3]">
              Your images
            </span>
            <span className="rounded-md bg-[#1E2533] px-1.5 py-0.5 text-[10px] font-medium text-[#828DA3]">
              {images.length}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {images.length === 0 ? (
            <button
              type="button"
              onClick={handleUploadImage}
              disabled={isUploading}
              className="hover:border-primary/30 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#2A3242] bg-[#1E2533]/50 px-3 py-8 text-center transition-colors hover:bg-[#1E2533]"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-[#2A3242]/70">
                <ImageIcon className="size-4 text-[#586378]" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#F4F7FC]">
                  No images yet
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#828DA3]">
                  Upload PNG, JPG, or SVG to drag onto the canvas
                </p>
              </div>
            </button>
          ) : (
            images.map(
              (image) =>
                image?.diagramImageId && (
                  <div
                    key={image.diagramImageId}
                    draggable
                    title={image.fileName ?? 'Diagram image'}
                    className={cn(
                      'group cursor-grab overflow-hidden rounded-lg border border-[#2A3242] bg-[#1E2533]',
                      'hover:border-primary/40 transition-all select-none hover:bg-[#232b3a] active:cursor-grabbing'
                    )}
                    onDragStart={(event: React.DragEvent) => {
                      componentDragDataTransfer(
                        event,
                        'image',
                        {
                          src: image.imageUrl ?? '',
                          componentFields: [
                            {
                              componentFieldId: 'name',
                              type: ComponentInputType.TextInput,
                              label: 'Name',
                              isReadonly: true,
                              data: [{ value: image.fileName ?? 'Image' }],
                            },
                            {
                              componentFieldId: 'description',
                              type: ComponentInputType.TextInput,
                              label: 'Description',
                            },
                          ],
                        },
                        {
                          width: 100,
                        }
                      )
                    }}
                  >
                    <div className="flex aspect-square items-center justify-center bg-[#141925] p-2">
                      <img
                        src={image.imageUrl ?? ''}
                        alt={image.fileName || 'Diagram image'}
                        className="max-h-full max-w-full object-contain"
                        draggable={false}
                      />
                    </div>

                    {image.fileName && (
                      <p className="truncate border-t border-[#2A3242] px-2 py-1.5 text-[10px] text-[#828DA3] group-hover:text-[#F4F7FC]">
                        {image.fileName}
                      </p>
                    )}
                  </div>
                )
            )
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
