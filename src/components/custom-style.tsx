import { ComponentProps } from 'react'

type CustomStyleProps = ComponentProps<'style'> & {
  global?: boolean
  jsx?: boolean
}

export function CustomStyle({ ...props }: CustomStyleProps) {
  return <style {...props}></style>
}
