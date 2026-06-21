export function UigraphMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="UIGraph"
      style={{ borderRadius: 8, flexShrink: 0 }}
    >
      <rect width="64" height="64" rx="16" fill="#0B0E16" />
      <g stroke="#3B6BFF" strokeWidth="4" strokeLinecap="round">
        <line x1="20" y1="20" x2="44" y2="20" />
        <line x1="44" y1="20" x2="44" y2="44" />
        <line x1="44" y1="44" x2="20" y2="44" />
        <line x1="20" y1="44" x2="20" y2="20" />
      </g>
      <circle cx="44" cy="20" r="6" fill="#3B6BFF" />
      <circle cx="44" cy="44" r="6" fill="#3B6BFF" />
      <circle cx="20" cy="44" r="6" fill="#3B6BFF" />
      <circle cx="20" cy="20" r="6.5" fill="#FFFFFF" />
    </svg>
  )
}
