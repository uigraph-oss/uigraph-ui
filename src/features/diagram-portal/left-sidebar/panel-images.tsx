'use client'

import { uploadGlobalFile } from '@/api'
import { Button } from '@/components/ui/button'
import { ComponentInputType } from '@/features/component-meta'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { openFileExplorer } from 'daily-code/browser'
import { ImageIcon, Upload } from 'lucide-react'
import { useMemo } from 'react'
import {
  CREATE_DIAGRAM_IMAGE_MUTATION,
  GET_DIAGRAM_IMAGES_QUERY,
} from '../api/images'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'

export function SidebarImages() {
  const { diagramId } = useFlowDiagramContext()

  const [createDiagramImage] = useMutation(CREATE_DIAGRAM_IMAGE_MUTATION, {
    refetchQueries: [GET_DIAGRAM_IMAGES_QUERY],
    awaitRefetchQueries: true,
  })

  const { data, refetch } = useQuery(GET_DIAGRAM_IMAGES_QUERY, {
    variables: { diagramId: diagramId! },
    skip: !diagramId,
  })

  const images = useMemo(() => {
    return arrayNonNullable(data?.v1GetDiagramImages)
  }, [data?.v1GetDiagramImages])

  async function handleUploadImage() {
    if (!diagramId) return

    try {
      const [file] = await openFileExplorer({ accept: 'image/*' })
      if (!file) return

      const fileId = await uploadGlobalFile(file)
      await createDiagramImage({
        variables: {
          diagramId,
          input: {
            fileId,
            fileName: file.name,
            order: images.length,
          },
        },
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
