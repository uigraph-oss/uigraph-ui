import { useEffect, useState } from 'react'

export function useNow(intervalMS = 1000) {
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, intervalMS)

    return () => clearInterval(interval)
  }, [intervalMS])

  return now
}
