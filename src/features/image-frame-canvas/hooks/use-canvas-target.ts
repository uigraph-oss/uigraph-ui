import { useSearchParamsState } from '@/hooks/use-search-params-state'

export function useCanvasTarget() {
  const [searchParams, setSearchParams] = useSearchParamsState('point', 'group')

  return {
    focalPoint: searchParams.point,
    frameGroup: searchParams.group,

    clearTarget() {
      setSearchParams({
        point: null,
        group: null,
      })
    },

    setTarget(target: keyof typeof searchParams, value: string | null) {
      setSearchParams({
        point: null,
        group: null,
        [target]: value,
      })
    },
  }
}
