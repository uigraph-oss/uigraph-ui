'use client'

import { clientV2 } from '@/api-v2/client'
import { Button } from '@/components/ui/button'
import { ComponentInputType } from '@/features/component-meta'
import { useMutation, useQuery } from '@apollo/client'
import axios from 'axios'
import { arrayNonNullable } from 'daily-code'
import { openFileExplorer } from 'daily-code/browser'
import { ImageIcon, Upload } from 'lucide-react'
import { useMemo } from 'react'
import { CREATE_DIAGRAM_IMAGE_V2, DIAGRAM_IMAGES_V2 } from '../api/images-v2'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'

export function SidebarImages() {
  const { diagramId, organizationId } = useFlowDiagramContext()

  const [createDiagramImage] = useMutation(CREATE_DIAGRAM_IMAGE_V2, {
    client: clientV2,
  })

  const { data, refetch } = useQuery(DIAGRAM_IMAGES_V2, {
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

      const { data } = await createDiagramImage({
        variables: {
          orgId: organizationId,
          diagramId,
          input: {
            fileName: file.name,
            order: images.length,
          },
        },
      })

      const uploadURL = data?.createDiagramImage?.fileUploadURL
      if (!uploadURL) throw new Error('Failed to get file upload URL')

      await axios.put(uploadURL, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      })

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
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <p className="text-xs text-gray-500">No images</p>
              <p className="text-[10px] text-gray-400">
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
                          src: image.fileURL || '',
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
                      src={image.fileURL || ''}
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
