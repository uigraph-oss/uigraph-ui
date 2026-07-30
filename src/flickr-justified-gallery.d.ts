declare module 'flickr-justified-gallery' {
  export default function fjGallery(
    element: Element,
    options: {
      itemSelector?: string
      rowHeight?: number
      lastRow?: 'left' | 'center' | 'right' | 'justify' | 'hide'
      gutter?: number
      rowHeightTolerance?: number
      calculateItemsHeight?: boolean
    }
  ): void
}
