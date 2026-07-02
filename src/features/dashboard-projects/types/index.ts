import { PageProfile } from '@/types'

export interface ImplementationItem {
  id: string
  type:
    | 'flow-diagram'
    | 'api-contract'
    | 'performance-sla'
    | 'component-link'
    | 'business-logic'
  title: string
  content?: string
  status: 'draft' | 'live' | 'archived'
  updatedAt: string
  metadata?: {
    thumbnail?: string
    method?: string
    path?: string
    metrics?: Array<{ name: string; value: string; unit: string }>
    componentPath?: string
    repository?: string
  }
}

export interface QualityItem {
  id: string
  type: 'accessibility' | 'performance' | 'security' | 'testing'
  title: string
  content?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  updatedAt: string
}

export interface CommentItem {
  id: string
  author: {
    name: string
    avatar: string
    role?: string
  }
  content: string
  createdAt: string
  updatedAt?: string
  replies?: CommentReply[]
}

export interface CommentReply {
  id: string
  author: {
    name: string
    avatar: string
    role?: string
  }
  content: string
  createdAt: string
}

export interface NoteItem {
  id: string
  title: string
  content: string
  type: 'markdown' | 'checklist'
  updatedAt: string
}

export interface FocalPoint {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  implementation: ImplementationItem[]
  quality: QualityItem[]
  notes: NoteItem[]
  comments: CommentItem[]
  createdAt: string
  updatedAt: string
}

export interface ApiContractData {
  id?: string
  type: 'api-contract'
  title: string
  status: string
  metadata: {
    method: string
    path: string
  }
}

export interface FlowDiagramData {
  id?: string
  type: 'flow-diagram'
  title: string
  status: string
  metadata?: {
    thumbnail?: string
  }
}

export interface PerformanceSlaData {
  id?: string
  type: 'performance-sla'
  title: string
  status: string
  metadata?: {
    thumbnail?: string
  }
}

export interface ComponentLinkData {
  id?: string
  type: 'component-link'
  title: string
  status: string
  metadata?: {
    componentPath?: string
    repository?: string
  }
}

export interface BusinessLogicData {
  id?: string
  type: 'business-logic'
  title: string
  status: string
  content: string
}

export interface NoteData {
  id?: string
  type: 'note'
  title: string
  content: string
}

export interface SectionConfig {
  title: string
  description: string
  icon: React.ElementType | string
}

export interface Project {
  id: string
  title: string
  description: string
  date: string
  status: 'Active' | 'Inactive' | 'Completed'
  image: string
  collaborators: Collaborator[]
  pages: number
  teamId?: string
  canvasLayout?: CanvasLayout
}

export interface Page {
  id: string
  title: string
  description: string
  date: string
  status: 'Draft' | 'Published' | 'Review'
  thumbnail: string
  collaborators: Collaborator[]
  projectId: string
  version: string
  profile?: PageProfile
  focalPoints?: FocalPoint[]
}

export interface CanvasLayout {
  zoom: number
  pan: { x: number; y: number }
  pagePositions: Array<{
    id: string
    x: number
    y: number
    width: number
    height: number
  }>
  lastSaved: string
}

export interface Collaborator {
  name: string
  avatar: string
}

export interface Team {
  id: string
  name: string
  memberCount: number
}
