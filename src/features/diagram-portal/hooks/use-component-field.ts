import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { TComponentField } from '../types/component-fields'

type Options = {
  label?: string
  componentFieldId?: string
}

export function useComponentField<T>(
  componentFields: (TComponentField | undefined | null)[] | undefined | null,
  options: Options
): T | null {
  const optionsString = JSON.stringify(options)

  return useMemo(() => {
    const optionsObject = JSON.parse(optionsString)
    if (Object.keys(optionsObject).length === 0) return null
    if (!componentFields) return null

    const fields = arrayNonNullable(componentFields)
    const data = flattenMetaData(fields, fields)

    const componentField = fields.find((f) => {
      for (const key in optionsObject) {
        const match =
          f[key as keyof TComponentField] ===
          optionsObject[key as keyof Options]

        if (!match) return false
      }

      return true
    })

    const componentFieldId = componentField?.componentFieldId
    if (!componentFieldId) return null

    return data[componentFieldId] ?? null
  }, [componentFields, optionsString])
}

export function getComponentField<T>(
  componentFields: (TComponentField | undefined | null)[] | undefined | null,
  options: Options
): T | null {
  if (Object.keys(options).length === 0) return null
  if (!componentFields) return null

  const fields = arrayNonNullable(componentFields)
  const data = flattenMetaData(fields, fields)

  const componentField = fields.find((f) => {
    for (const key in options) {
      const match =
        f[key as keyof TComponentField] === options[key as keyof Options]

      if (!match) return false
    }

    return true
  })

  const componentFieldId = componentField?.componentFieldId
  if (!componentFieldId) return null

  return data[componentFieldId] ?? null
}
