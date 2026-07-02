import { formatDistanceToNow } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

export function useTimeDistanceFromNow(
  ...args: Parameters<typeof formatDistanceToNow>
) {
  const [output, setOutput] = useState<string>(() =>
    formatDistanceToNow(...args)
  )

  const outputRef = useRef({
    output,
  })

  outputRef.current = {
    output,
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const result = formatDistanceToNow(...args)
      if (result !== outputRef.current.output) {
        outputRef.current.output = result
        setOutput(result)
      }
    }, 30 * 1000)

    return () => clearInterval(interval)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputRef, setOutput, ...args.map((arg) => JSON.stringify(arg))])

  return output
}
