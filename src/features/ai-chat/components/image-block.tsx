import 'react-photo-view/dist/react-photo-view.css'

import { Button } from '@/components/ui/button'
import { DIAGRAM_IMAGES } from '@/features/diagram-portal/api/images'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { downloadFileUrl } from 'daily-code/browser'
import { RxOpenInNewWindow } from 'react-icons/rx'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { getImageSourceUrl } from '../helpers/parse-source'

export function ImageBlock({ src, alt }: { src: string | Blob; alt?: string }) {
  const parsed = getImageSourceUrl(
    typeof src === 'string' ? src : URL.createObjectURL(src)
  )

  const orgId = useCurrentOrganization()?.id
  const { data } = useQuery(DIAGRAM_IMAGES, {
    variables: { orgId: orgId ?? '', diagramId: parsed.diagramId ?? '' },
    skip: !orgId || !parsed.diagramId,
  })

  const resolvedSrc = parsed.diagramId
    ? (data?.diagramImages?.[0]?.imageUrl ?? '')
    : parsed.src

  return (
    <PhotoProvider>
      <div className="group relative w-fit">
        <PhotoView src={resolvedSrc}>
          <img
            alt={alt}
            src={resolvedSrc}
            className="border-stock/50 max-h-96 w-auto cursor-pointer rounded-md border object-contain"
          />
        </PhotoView>

        {parsed.href && (
          <Button
            preset="outline"
            className="absolute top-2 right-11 size-7! rounded-md p-1! opacity-0 group-hover:opacity-100"
          >
            <a href={parsed.href} target="_blank" rel="noopener noreferrer">
              <RxOpenInNewWindow />
            </a>
          </Button>
        )}

        <Button
          preset="outline"
          className="absolute top-2 right-2 size-7! rounded-md p-1! opacity-0 group-hover:opacity-100"
          onClick={() => {
            downloadFileUrl(resolvedSrc, {
              filename: alt || 'image',
            })
          }}
        >
          <HugeiconsIcon icon={Download01Icon} />
        </Button>
      </div>
    </PhotoProvider>
  )
}
