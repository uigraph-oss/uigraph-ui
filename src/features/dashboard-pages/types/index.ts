import { V2 } from '@/api-v2'

export type ComponentsGroup = {
  name: string
  components: V2.Component[]
}

export type FocalPointPreset = 'mobile' | 'tablet' | 'desktop'
