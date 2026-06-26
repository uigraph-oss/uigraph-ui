import { arrayNonNullable, StringLiteralLoose } from 'daily-code'
import { ReactNode } from 'react'
import { BsDatabase, BsDiagram3 } from 'react-icons/bs'

import { env } from '@/env'

const ANCHOR_DIAGRAM_REGEX = /^diagram\/(?<id>diagram_[a-f0-9-]+)$/i
const ANCHOR_SERVICE_REGEX = /^service\/(?<id>service_[a-f0-9-]+)$/i
const ANCHOR_FRAME_REGEX =
  /^frame\/(?<projectId>project_[a-f0-9-]+)\/(?<frameId>frame_[a-f0-9-]+)$/i

export function getAnchorSourceHref(input: string): string {
  if (typeof window === 'undefined') return input

  const match = input.match(ANCHOR_DIAGRAM_REGEX)
  if (match?.groups?.id) {
    // http://localhost:3000/diagram/diagram_bb6d0095-efa1-4dc0-808e-56a37e79fe4b
    return `${location.origin}/diagram/${match.groups.id}?source=chat`
  }

  const serviceMatch = input.match(ANCHOR_SERVICE_REGEX)
  if (serviceMatch?.groups?.id) {
    // http://localhost:3000/services/service_123e4567-e89b-12d3-a456-426614174000
    return `${location.origin}/services/${serviceMatch.groups.id}?source=chat`
  }

  const frameMatch = input.match(ANCHOR_FRAME_REGEX)
  if (frameMatch?.groups?.projectId && frameMatch?.groups?.frameId) {
    // http://localhost:3000/dashboard/frame/page_3cd992df-b13a-4305-b26d-30bc2524a8e1
    return `${location.origin}/frame/${frameMatch.groups.frameId}?source=chat`
  }

  return input
}

const IMAGE_DIAGRAM_REGEX = /^diagram\/diagram_(?<id>[a-f0-9-]+)$/i

export function getImageSourceUrl(input: string): {
  href?: string
  src: string
} {
  const match = input.match(IMAGE_DIAGRAM_REGEX)
  if (match?.groups?.id) {
    return {
      src: `${env.VITE_ASSETS_URL}/file_${match.groups.id}?source=chat`,
      href: `${location.origin}/diagram/${match.groups.id}?source=chat`,
    }
  }

  return { src: input }
}

type SourcesInputType = {
  artifactType: StringLiteralLoose<`diagram` | `service` | `frame` | `doc`>
  artifactName: string
  artifactId: string
}

type SourceOutputType = {
  href: string | undefined
  name: ReactNode | undefined
  icon: ReactNode | undefined
}

function getSourceHref(artifact: SourcesInputType): string | undefined {
  if (typeof window === 'undefined') return undefined

  if (artifact.artifactType === 'diagram') {
    return `${location.origin}/diagram/${artifact.artifactId}?source=chat`
  }

  if (artifact.artifactType === 'service') {
    return `${location.origin}/services/${artifact.artifactId}?source=chat`
  }

  if (artifact.artifactType === 'frame') {
    return `${location.origin}/frame/${artifact.artifactId}?source=chat`
  }
}

export function resolveSources(
  sources: SourcesInputType[]
): SourceOutputType[] {
  const linkedSources = arrayNonNullable(
    sources.map((s) => {
      const href = getSourceHref(s)
      if (!href) return null

      return { href, type: s.artifactType, name: s.artifactName }
    })
  )

  const uniqueSources: typeof linkedSources = [
    ...new Set(linkedSources.map((s) => JSON.stringify(s))),
  ].map((s) => JSON.parse(s))

  return uniqueSources.map(({ href, name, type }) => {
    return {
      href,
      name,

      icon:
        type === 'diagram' ? (
          <BsDiagram3 />
        ) : type === 'database' ? (
          <BsDatabase />
        ) : undefined,
    }
  })
}
