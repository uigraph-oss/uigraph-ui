import { GT } from '@/api'

export type ComponentsGroup = {
  name: string
  components: GT.Component[]
}

export type FocalPointPreset = 'mobile' | 'tablet' | 'desktop'
