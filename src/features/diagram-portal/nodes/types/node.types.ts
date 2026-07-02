import { Prettify } from '@/types'
import { TComponentField } from '../../types/component-fields'

type BaseNodeData = {
  componentFields?: TComponentField[]
}

export type NodeDataGenerator<TData extends Record<string, unknown>> = Prettify<
  (BaseNodeData & TData) & {
    hide?: Prettify<Partial<Record<keyof TData, boolean>>>
  }
>
