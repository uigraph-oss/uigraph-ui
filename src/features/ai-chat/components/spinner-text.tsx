import { useEffect, useRef, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { SPINNER_VERBS } from '../constants'

const MIN_INTERVAL = 5000
const MAX_INTERVAL = 25000

function getRandomInterval(): number {
  return (
    Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL)) + MIN_INTERVAL
  )
}

function getRandomVerb(): string {
  return SPINNER_VERBS[Math.floor(Math.random() * SPINNER_VERBS.length)]
}

export function SpinnerText() {
  const [verb, setVerb] = useState(getRandomVerb)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    function scheduleNext() {
      timeoutRef.current = setTimeout(() => {
        setVerb(getRandomVerb())
        scheduleNext()
      }, getRandomInterval())
    }

    scheduleNext()
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <AiOutlineLoading3Quarters className="size-3 animate-spin text-gray-400" />
      <span className="text-xs text-gray-400">{verb}...</span>
    </div>
  )
}
