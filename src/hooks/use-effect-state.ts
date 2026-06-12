import { useEffect, useState } from 'react'

export function useEffectState<T>(input: T) {
  const [state, setState] = useState<T>(input)

  useEffect(() => {
    setState(input)
  }, [input])

  return [state, setState] as const
}
