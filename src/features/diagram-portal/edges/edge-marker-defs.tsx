const DEFAULT_MARKER_SIZE = 6

function ErdOneMarker(props: React.SVGProps<SVGMarkerElement>) {
  return (
    <marker
      id="erdOne"
      viewBox="0 0 12 12"
      markerWidth={DEFAULT_MARKER_SIZE}
      markerHeight={DEFAULT_MARKER_SIZE}
      refX="12"
      refY="6"
      orient="auto-start-reverse"
      {...props}
    >
      <path
        d="M10 1 L10 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
    </marker>
  )
}

function ErdManyMarker(props: React.SVGProps<SVGMarkerElement>) {
  return (
    <marker
      id="erdMany"
      viewBox="0 0 12 12"
      markerWidth={DEFAULT_MARKER_SIZE}
      markerHeight={DEFAULT_MARKER_SIZE}
      refX="12"
      refY="6"
      orient="auto-start-reverse"
      {...props}
    >
      <path
        d="M4 6 L11 1"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M4 6 L11 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M4 6 L11 6"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
    </marker>
  )
}

function ErdOnlyOneMarker(props: React.SVGProps<SVGMarkerElement>) {
  return (
    <marker
      id="erdOnlyOne"
      viewBox="0 0 12 12"
      markerWidth={DEFAULT_MARKER_SIZE}
      markerHeight={DEFAULT_MARKER_SIZE}
      refX="12"
      refY="6"
      orient="auto-start-reverse"
      {...props}
    >
      <path
        d="M8 1 L8 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M10 1 L10 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
    </marker>
  )
}

function ErdZeroOrOneMarker(props: React.SVGProps<SVGMarkerElement>) {
  return (
    <marker
      id="erdZeroOrOne"
      viewBox="0 0 16 12"
      markerWidth={DEFAULT_MARKER_SIZE}
      markerHeight={DEFAULT_MARKER_SIZE}
      refX="16"
      refY="6"
      orient="auto-start-reverse"
      {...props}
    >
      <circle
        cx="8"
        cy="6"
        r="2.5"
        stroke="context-stroke"
        strokeWidth="2"
        fill="white"
      />
      <path
        d="M13 1 L13 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
    </marker>
  )
}

function ErdOneOrManyMarker(props: React.SVGProps<SVGMarkerElement>) {
  return (
    <marker
      id="erdOneOrMany"
      viewBox="0 0 18 12"
      markerWidth={DEFAULT_MARKER_SIZE}
      markerHeight={DEFAULT_MARKER_SIZE}
      refX="18"
      refY="6"
      orient="auto-start-reverse"
      {...props}
    >
      <path
        d="M8 1 L8 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M6 6 L17 1"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M6 6 L17 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M6 6 L17 6"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
    </marker>
  )
}

function ErdZeroOrManyMarker(props: React.SVGProps<SVGMarkerElement>) {
  return (
    <marker
      id="erdZeroOrMany"
      viewBox="0 0 20 12"
      markerWidth={DEFAULT_MARKER_SIZE}
      markerHeight={DEFAULT_MARKER_SIZE}
      refX="20"
      refY="6"
      orient="auto-start-reverse"
      {...props}
    >
      <circle
        cx="8"
        cy="6"
        r="2.5"
        stroke="context-stroke"
        strokeWidth="2"
        fill="white"
      />
      <path
        d="M10 6 L19 1"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M10 6 L19 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M10 6 L19 6"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
    </marker>
  )
}

function ErdOneToManyMarker(props: React.SVGProps<SVGMarkerElement>) {
  return (
    <marker
      id="erdOneToMany"
      viewBox="0 0 18 12"
      markerWidth={DEFAULT_MARKER_SIZE}
      markerHeight={DEFAULT_MARKER_SIZE}
      refX="18"
      refY="6"
      orient="auto-start-reverse"
      {...props}
    >
      <path
        d="M7 1 L7 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8.5 6 L17 1"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8.5 6 L17 11"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8.5 6 L17 6"
        stroke="context-stroke"
        strokeWidth="2"
        fill="none"
      />
    </marker>
  )
}

export function EdgeMarkerDefs() {
  return (
    <svg>
      <defs>
        <ErdOneMarker />
        <ErdManyMarker />
        <ErdOnlyOneMarker />
        <ErdZeroOrOneMarker />
        <ErdOneToManyMarker />
        <ErdOneOrManyMarker />
        <ErdZeroOrManyMarker />
      </defs>
    </svg>
  )
}
