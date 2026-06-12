import { graphql } from '@/api'

export type GqlAiChatSession = {
  sessionId: string
  orgId: string
  userId: string
  title: string
  isPinned: boolean
  messageCount: number
  createdAt: string
  updatedAt: string
}

export type GqlAiSourceRef = {
  artifactType: string
  artifactId: string
  artifactName: string
  chunkType: string
}

export type GqlAiChatMessage = {
  messageId: string
  sessionId: string
  role: string
  content: string
  createdAt: string
  sources?: GqlAiSourceRef[] | null
}

export const LIST_CHAT_SESSIONS = graphql(`
  query V1AiListChatSessions($orgId: String!) {
    v1AiListChatSessions(orgId: $orgId) {
      sessions {
        sessionId
        orgId
        userId
        title
        isPinned
        messageCount
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`)

export type ListChatSessionsResponse = {
  v1AiListChatSessions: {
    sessions: GqlAiChatSession[]
    nextToken?: string | null
  }
}

export const GET_CHAT_SESSION = graphql(`
  query V1AiGetChatSession($sessionId: String!) {
    v1AiGetChatSession(sessionId: $sessionId) {
      session {
        sessionId
        orgId
        userId
        title
        isPinned
        messageCount
        createdAt
        updatedAt
      }
      messages {
        messageId
        sessionId
        role
        content
        createdAt
        sources {
          artifactType
          artifactId
          artifactName
          chunkType
        }
      }
    }
  }
`)

export type GetChatSessionResponse = {
  v1AiGetChatSession: {
    session: GqlAiChatSession
    messages: GqlAiChatMessage[]
  }
}

export const CREATE_CHAT_SESSION = graphql(`
  mutation V1AiCreateChatSession($orgId: String!) {
    v1AiCreateChatSession(orgId: $orgId) {
      sessionId
      orgId
      userId
      title
      isPinned
      messageCount
      createdAt
      updatedAt
    }
  }
`)

export type CreateChatSessionResponse = {
  v1AiCreateChatSession: GqlAiChatSession
}

export const DELETE_CHAT_SESSION = graphql(`
  mutation V1AiDeleteChatSession($sessionId: String!) {
    v1AiDeleteChatSession(sessionId: $sessionId)
  }
`)

export const UPDATE_CHAT_SESSION = graphql(`
  mutation V1AiUpdateChatSession(
    $sessionId: String!
    $input: AiUpdateSessionInput!
  ) {
    v1AiUpdateChatSession(sessionId: $sessionId, input: $input) {
      sessionId
      orgId
      userId
      title
      isPinned
      messageCount
      createdAt
      updatedAt
    }
  }
`)

export type UpdateChatSessionResponse = {
  v1AiUpdateChatSession: GqlAiChatSession
}
