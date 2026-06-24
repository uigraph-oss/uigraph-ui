import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useRef, useState } from 'react'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioRenderer({ fileURL }: { fileURL: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  function focusContainer() {
    containerRef.current?.focus()
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      void audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current
    if (!audio) return
    const time = Number(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  function seekBy(delta: number) {
    const audio = audioRef.current
    if (!audio) return
    const time = Math.min(Math.max(0, audio.currentTime + delta), duration || 0)
    audio.currentTime = time
    setCurrentTime(time)
  }

  function changeVolume(next: number) {
    const audio = audioRef.current
    if (!audio) return
    const clamped = Math.min(Math.max(0, next), 1)
    audio.volume = clamped
    audio.muted = clamped === 0
    setVolume(clamped)
    setIsMuted(clamped === 0)
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    changeVolume(Number(e.target.value))
  }

  function toggleMute() {
    const audio = audioRef.current
    if (!audio) return
    const next = !isMuted
    audio.muted = next
    setIsMuted(next)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return

    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      togglePlay()
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
      changeVolume((audioRef.current?.volume ?? 0) + 0.1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      changeVolume((audioRef.current?.volume ?? 0) - 0.1)
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      <div
        ref={containerRef}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl rounded-2xl bg-[#141925] p-6 ring-1 ring-[#2A3242] outline-none"
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              togglePlay()
              focusContainer()
            }}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#015AEB] text-white transition-colors hover:bg-[#0146b8] [&_svg]:size-5"
          >
            {isPlaying ? (
              <Pause fill="currentColor" />
            ) : (
              <Play fill="currentColor" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step="any"
              value={currentTime}
              onChange={handleSeek}
              className="h-1 w-full cursor-pointer accent-[#015AEB]"
            />
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-[#828DA3]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              toggleMute()
              focusContainer()
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#828DA3] transition-colors hover:text-[#F4F7FC] [&_svg]:size-4"
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
            className="h-1 w-20 cursor-pointer accent-[#015AEB]"
          />
        </div>

        <audio
          ref={audioRef}
          src={fileURL}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
        >
          <track kind="captions" />
        </audio>
      </div>
    </div>
  )
}
