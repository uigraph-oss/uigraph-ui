export type FilterNullable<T extends unknown[]> = Extract<
  T[number],
  null | undefined
>

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type MergeObject<T, U> = Omit<T, keyof U> & U
