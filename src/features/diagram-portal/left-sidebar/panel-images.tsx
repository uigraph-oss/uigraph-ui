'use client'

import { clientV2 } from '@/api/client'
import { Button } from '@/components/ui/button'
import { ComponentInputType } from '@/features/component-meta'
import { useQuery } from '@apollo/client'
import axios from 'axios'
import { arrayNonNullable } from 'daily-code'
import { openFileExplorer } from 'daily-code/browser'
import { ImageIcon, Upload } from 'lucide-react'
import { useMemo } from 'react'
import { DIAGRAM_IMAGES } from '../api/images'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'

export function SidebarImages() {
  const { diagramId, organizationId } = useFlowDiagramContext()

  const { data, refetch } = useQuery(DIAGRAM_IMAGES, {
    client: clientV2,
    variables: { orgId: organizationId!, diagramId: diagramId! },
    skip: !diagramId || !organizationId,
  })

  const images = useMemo(() => {
    return arrayNonNullable(data?.diagramImages)
  }, [data?.diagramImages])

  async function handleUploadImage() {
    if (!diagramId || !organizationId) return

    try {
      const [file] = await openFileExplorer({ accept: 'image/*' })
      if (!file) return

      const form = new FormData()
      form.append('file', file)
      form.append('fileName', file.name)
      form.append('order', String(images.length))

      await axios.post(
        `/api/v1/orgs/${organizationId}/diagrams/${diagramId}/images`,
        form,
        { withCredentials: true }
      )

      await refetch()
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  return (
    <SidebarLayout className="left-18">
      <div className="flex w-[10.5rem] flex-col gap-2 p-1">
        <Button preset="primary" onClick={handleUploadImage} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>

        <div className="flex flex-col gap-1.5">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg p-6 text-center">
              <ImageIcon className="text-muted-foreground h-8 w-8" />
              <p className="text-muted-foreground text-xs">No images</p>
              <p className="text-muted-foreground text-[10px]">
                Upload an image to get started
              </p>
            </div>
          ) : (
            images.map(
              (image) =>
                image?.diagramImageId && (
                  <div
                    key={image.diagramImageId}
                    draggable
                    className="flex cursor-grab items-center justify-center rounded-[0.5rem] bg-transparent transition-all select-none active:cursor-grabbing"
                    onDragStart={(event: React.DragEvent) => {
                      componentDragDataTransfer(
                        event.dataTransfer,
                        'image',
                        {
                          src: image.imageUrl ?? '',
                          componentFields: [
                            {
                              componentFieldId: 'name',
                              type: ComponentInputType.TextInput,
                              label: 'Name',
                              isReadonly: true,
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
                    <img
                      src={image.imageUrl ?? ''}
                      alt={image.fileName || ''}
                      className="w-[9.5rem] rounded-md"
                    />
                  </div>
                )
            )
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
