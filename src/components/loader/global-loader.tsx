export function GlobalLoader({ width = 128 }) {
  const height = width
  const ringSize = width + 16

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        {/* Logo Container */}
        <div
          className="relative"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* Spinning Ring */}
          <div
            className="absolute animate-spin rounded-full border-2 border-white/10 border-t-white/40 opacity-30"
            style={{
              width: `${ringSize}px`,
              height: `${ringSize}px`,
              top: '-8px',
              left: '-8px',
            }}
          ></div>

          {/* Logo */}
          <div className="flex h-full w-full items-center justify-center">
            <img
              src="/icons/icon-blue-256.png"
              alt="UIGraph"
              width={width}
              height={height}
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
