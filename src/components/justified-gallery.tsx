'use client'

import fjGallery from 'flickr-justified-gallery'
import LightGallery from 'lightgallery/react'
import { ReactNode, useEffect, useRef } from 'react'

import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lightgallery.css'

import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'

interface JustifiedGalleryProps {
  images: string[]
  imageHeight?: number
  galleryId?: string
  renderImage?: (image: string) => ReactNode
}

export function JustifiedGallery({
  images,
  imageHeight,
  galleryId,
  renderImage,
}: JustifiedGalleryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imagesId = [images.length, images.join('#')].join('@')

  useEffect(() => {
    if (!images.length) return

    const container = containerRef.current
    if (!container) return

    const galleryElement = container.querySelector('.gallery')
    if (!galleryElement) return

    fjGallery(galleryElement, {
      itemSelector: '.gallery__item',
      rowHeight: imageHeight ?? 80,
      lastRow: 'justify',
      gutter: 5,
      rowHeightTolerance: 0.2,
      calculateItemsHeight: false,
    })
  }, [imagesId, imageHeight, images.length])

  if (!images.length) return null

  return (
    <div ref={containerRef}>
      <LightGallery
        key={imagesId}
        plugins={[lgZoom, lgThumbnail]}
        mode="lg-fade"
        thumbnail={true}
        galleryId={galleryId ?? 'media-gallery'}
        elementClassNames={'gallery gallery-wrapper'}
        mobileSettings={{
          controls: false,
          showCloseIcon: false,
          download: false,
          rotate: false,
        }}
      >
        {images.map((image, index) => (
          <div key={image} data-src={image} className="gallery__item block">
            {renderImage ? (
              renderImage(image)
            ) : (
              <img
                src={image}
                alt={`Gallery item ${index + 1}`}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </LightGallery>
    </div>
  )
}
