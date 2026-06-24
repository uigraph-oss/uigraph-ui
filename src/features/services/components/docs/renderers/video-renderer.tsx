import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useRef, useState } from 'react'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VideoRenderer({ fileURL }: { fileURL: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  function focusContainer() {
    containerRef.current?.focus()
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const time = Number(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  function seekBy(delta: number) {
    const video = videoRef.current
    if (!video) return
    const time = Math.min(Math.max(0, video.currentTime + delta), duration || 0)
    video.currentTime = time
    setCurrentTime(time)
  }

  function changeVolume(next: number) {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.min(Math.max(0, next), 1)
    video.volume = clamped
    video.muted = clamped === 0
    setVolume(clamped)
    setIsMuted(clamped === 0)
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    changeVolume(Number(e.target.value))
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    const next = !isMuted
    video.muted = next
    setIsMuted(next)
  }

  function toggleFullscreen() {
    const container = containerRef.current
    if (!container) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void container.requestFullscreen()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return

    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      togglePlay()
    } else if (e.key === 'f') {
      e.preventDefault()
      toggleFullscreen()
    } else if (e.key === 'm') {
      e.preventDefault()
      toggleMute()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      seekBy(-5)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      seekBy(5)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      changeVolume((videoRef.current?.volume ?? 0) + 0.1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      changeVolume((videoRef.current?.volume ?? 0) - 0.1)
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div
        ref={containerRef}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="group relative w-full max-w-5xl overflow-hidden rounded-lg bg-black outline-none"
      >
        <video
          ref={videoRef}
          src={fileURL}
          onClick={() => {
            togglePlay()
            focusContainer()
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="max-h-[80vh] w-full"
        >
          <track kind="captions" />
        </video>

        {!isPlaying && (
          <button
            type="button"
            onClick={() => {
              togglePlay()
              focusContainer()
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm [&_svg]:size-7">
              <Play fill="currentColor" />
            </span>
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => {
              togglePlay()
              focusContainer()
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:text-white/80 [&_svg]:size-5"
          >
            {isPlaying ? (
              <Pause fill="currentColor" />
            ) : (
              <Play fill="currentColor" />
            )}
          </button>

          <span className="shrink-0 font-mono text-[11px] text-white/90">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step="any"
            value={currentTime}
            onChange={handleSeek}
            className="h-1 flex-1 cursor-pointer accent-[#015AEB]"
          />

          <span className="shrink-0 font-mono text-[11px] text-white/90">
            {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={() => {
              toggleMute()
              focusContainer()
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:text-white/80 [&_svg]:size-4"
          >
            {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="h-1 w-16 shrink-0 cursor-pointer accent-[#015AEB]"
          />

          <button
            type="button"
            onClick={() => {
              toggleFullscreen()
              focusContainer()
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:text-white/80 [&_svg]:size-4"
          >
            <Maximize />
          </button>
        </div>
      </div>
    </div>
  )
}
