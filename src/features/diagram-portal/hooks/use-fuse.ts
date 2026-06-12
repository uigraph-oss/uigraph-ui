import { useAutoRef } from '@/hooks/use-auto-ref'
import { arrayNonNullable } from 'daily-code'
import Fuse, { IFuseOptions } from 'fuse.js'
import { useMemo } from 'react'

type NonNullableArray<T extends unknown[] | undefined | null> = Exclude<
  Exclude<T, null | undefined>[number],
  null | undefined
>[]

export function useFuse<T extends unknown[] | undefined | null>(
  data: T,
  searchQuery: string,
  options?: IFuseOptions<NonNullableArray<T>>
): NonNullableArray<T> {
  const optionsRef = useAutoRef(options)

  const fused = useMemo(() => {
    const nonNullOptions = arrayNonNullable(data) as NonNullableArray<T>

    const fuse = new Fuse(nonNullOptions as unknown as NonNullableArray<T>[], {
      threshold: 0.5,
      ...optionsRef.current,
    })

    return { fuse, data: nonNullOptions }
  }, [data, optionsRef])

  return useMemo(() => {
    if (searchQuery === '') return fused.data
    return fused.fuse.search(searchQuery).map((result) => result.item)
  }, [fused, searchQuery]) as NonNullableArray<T>
}
