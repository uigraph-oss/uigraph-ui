import { useEffectExceptOnMount } from 'daily-code/react'
import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    const item = localStorage.getItem(key)
    if (item) setValue(JSON.parse(item))
  }, [key])

  useEffectExceptOnMount(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
