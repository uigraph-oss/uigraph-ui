import { useEffect, useState } from 'react'

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
      <div
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: 'red',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}
