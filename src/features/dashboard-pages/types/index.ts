import { V2 } from '@/api'

export type ComponentsGroup = {
  name: string
  components: V2.Component[]
}

export type FocalPointPreset = 'mobile' | 'tablet' | 'desktop'
