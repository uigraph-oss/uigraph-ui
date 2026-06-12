export type TComponentField = {
  componentFieldId?: string | null
  type?: string | null

  label?: string | null
  order?: number | null
  options?: (string | null)[] | null

  hidden?: boolean | null
  required?: boolean | null
  isReadonly?: boolean | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[] | null
}
