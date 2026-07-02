import { graphql, GT } from '@/api'
import { SavedQueryScope as GqlSavedQueryScope } from '@/api/.gql/graphql'
import { arrayNonNullable } from 'daily-code'
import {
  SavedQuery,
  SavedQueryFolder,
  SavedQueryScope,
  SaveQueryInput,
} from '../components/databases/queries/types'

function toGqlScope(scope: SavedQueryScope): GT.SavedQueryScope {
  return scope === 'team'
    ? GqlSavedQueryScope.Team
    : GqlSavedQueryScope.Personal
}

export const SAVED_QUERIES = graphql(`
  query SavedQueries(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $scope: SavedQueryScope!
  ) {
    savedQueries(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      scope: $scope
    ) {
      id
      folderId
      scope
      title
      description
      queryText
      tags
      createdBy
      createdAt
      updatedAt
      createdByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const SAVED_QUERY_FOLDERS = graphql(`
  query SavedQueryFolders(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $scope: SavedQueryScope!
  ) {
    savedQueryFolders(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      scope: $scope
    ) {
      id
      name
    }
  }
`)

export const CREATE_SAVED_QUERY = graphql(`
  mutation CreateSavedQuery(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $input: CreateSavedQueryInput!
  ) {
    createSavedQuery(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      input: $input
    ) {
      id
    }
  }
`)

export const UPDATE_SAVED_QUERY = graphql(`
  mutation UpdateSavedQuery(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $id: ID!
    $input: UpdateSavedQueryInput!
  ) {
    updateSavedQuery(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      id: $id
      input: $input
    ) {
      id
    }
  }
`)

export const DELETE_SAVED_QUERY = graphql(`
  mutation DeleteSavedQuery(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $id: ID!
  ) {
    deleteSavedQuery(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      id: $id
    )
  }
`)

export const CREATE_SAVED_QUERY_FOLDER = graphql(`
  mutation CreateSavedQueryFolder(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $input: CreateSavedQueryFolderInput!
  ) {
    createSavedQueryFolder(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      input: $input
    ) {
      id
      name
    }
  }
`)

export const DELETE_SAVED_QUERY_FOLDER = graphql(`
  mutation DeleteSavedQueryFolder(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $id: ID!
  ) {
    deleteSavedQueryFolder(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      id: $id
    )
  }
`)

export function toSavedQuery(q: {
  id: string
  folderId?: string | null
  scope: GT.SavedQueryScope
  title: string
  description?: string | null
  queryText: string
  tags?: string[] | null
  createdBy: string
  createdAt: string
  updatedAt: string
  createdByActor?: {
    name?: string | null
    avatarUrl?: string | null
  } | null
}): SavedQuery {
  return {
    id: q.id,
    title: q.title,
    description: q.description ?? undefined,
    queryText: q.queryText,
    scope: q.scope === GqlSavedQueryScope.Team ? 'team' : 'personal',
    folderId: q.folderId ?? null,
    tags: arrayNonNullable(q.tags),
    createdByUserId: q.createdBy,
    createdByName: q.createdByActor?.name ?? null,
    createdByAvatarUrl: q.createdByActor?.avatarUrl ?? null,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }
}

export function toSavedQueryFolder(f: {
  id: string
  name: string
}): SavedQueryFolder {
  return { id: f.id, name: f.name }
}

export function toCreateSavedQueryInput(
  scope: SavedQueryScope,
  input: SaveQueryInput
) {
  return {
    title: input.title,
    description: input.description,
    queryText: input.queryText,
    tags: input.tags,
    folderId: input.folderId,
    scope: toGqlScope(scope),
  }
}

export function toUpdateSavedQueryInput(input: SaveQueryInput) {
  return {
    title: input.title,
    description: input.description,
    queryText: input.queryText,
    tags: input.tags,
    folderId: input.folderId,
  }
}

export function toCreateSavedQueryFolderInput(
  scope: SavedQueryScope,
  name: string
) {
  return { name, scope: toGqlScope(scope) }
}
