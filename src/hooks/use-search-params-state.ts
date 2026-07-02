import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function useSearchParamsState<TKeys extends string[]>(...keys: TKeys) {
  type TState = Record<TKeys[number], string | null>

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const state: TState = useMemo(() => {
    const result: TState = {} as TState

    for (const key of keys) {
      result[key as TKeys[number]] = searchParams.get(key) ?? null
    }

    return result
  }, [keys, searchParams])

  const setState = useCallback(
    (state: Partial<TState>, replace?: boolean) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const _key in state) {
        const key = _key as TKeys[number]

        if (state[key] == null) {
          params.delete(key)
        } else {
          params.set(key, state[key])
        }
      }

      if (replace) {
        void navigate(`?${params.toString()}`, { replace: true })
      } else {
        void navigate(`?${params.toString()}`)
      }
    },
    [navigate, searchParams]
  )

  return [state, setState] as const
}
