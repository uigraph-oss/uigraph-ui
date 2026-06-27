import { useEffect, useState } from 'react'
import { GoComment } from 'react-icons/go'

export function VirtualCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <div className="flex size-7 -translate-y-full items-center justify-center rounded-full rounded-bl-none border-2 border-blue-500 bg-blue-100 text-blue-600 shadow-lg">
        <GoComment className="size-3.5" />
      </div>
    </div>
  )
}
