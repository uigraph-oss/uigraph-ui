export type SavedQueryScope = 'personal' | 'team'

export type SavedQueryFolder = {
  id: string
  name: string
}

export type SavedQuery = {
  id: string
  title: string
  description?: string
  queryText: string
  scope: SavedQueryScope
  folderId: string | null
  tags: string[]
  createdByUserId: string
  createdByName?: string | null
  createdByAvatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type SaveQueryInput = {
  title: string
  description: string
  queryText: string
  tags: string[]
  folderId: string | null
}
