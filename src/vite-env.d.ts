// Asset + side-effect module declarations (replacing Next's ambient types).
// Image imports mirror Next's static-import shape ({ src, ... }); the Vite
// `nextStaticAssets` plugin produces that object at runtime.

interface StaticImageData {
  src: string
  height: number
  width: number
  blurDataURL?: string
}

declare module '*.png' {
  const value: StaticImageData
  export default value
}
declare module '*.jpg' {
  const value: StaticImageData
  export default value
}
declare module '*.jpeg' {
  const value: StaticImageData
  export default value
}
declare module '*.gif' {
  const value: StaticImageData
  export default value
}
declare module '*.webp' {
  const value: StaticImageData
  export default value
}
declare module '*.avif' {
  const value: StaticImageData
  export default value
}
declare module '*.svg' {
  const value: StaticImageData
  export default value
}

declare module '*.css'
declare module '*.scss'
declare module '*.sass'
declare module '*.less'

interface Window {
  dataLayer: unknown[]
  gtag?: (...args: unknown[]) => void
  fbq?: (...args: unknown[]) => void
  twq?: (...args: unknown[]) => void
  clarity?: (...args: unknown[]) => void
}
