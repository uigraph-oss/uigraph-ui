import { graphql } from '@/api'

export const CHAT_SESSIONS = graphql(`
  query ChatSessions($orgId: ID!) {
    chatSessions(orgId: $orgId) {
      id
      orgId
      ownerUserId
      title
      isPinned
      messageCount
      createdAt
      updatedAt
    }
  }
`)

export const CHAT_SESSION = graphql(`
  query ChatSession($orgId: ID!, $id: ID!) {
    chatSession(orgId: $orgId, id: $id) {
      session {
        id
        orgId
        ownerUserId
        title
        isPinned
        messageCount
        createdAt
        updatedAt
      }
      messages {
        id
        chatSessionId
        role
        content
        createdAt
      }
    }
  }
`)

export const CREATE_CHAT_SESSION = graphql(`
  mutation CreateChatSession($orgId: ID!, $input: CreateChatSessionInput!) {
    createChatSession(orgId: $orgId, input: $input) {
      id
      orgId
      ownerUserId
      title
      isPinned
      messageCount
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_CHAT_SESSION = graphql(`
  mutation UpdateChatSession(
    $orgId: ID!
    $id: ID!
    $input: UpdateChatSessionInput!
  ) {
    updateChatSession(orgId: $orgId, id: $id, input: $input) {
      id
      orgId
      ownerUserId
      title
      isPinned
      messageCount
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_CHAT_SESSION = graphql(`
  mutation DeleteChatSession($orgId: ID!, $id: ID!) {
    deleteChatSession(orgId: $orgId, id: $id)
  }
`)

export const CREATE_CHAT_MESSAGE = graphql(`
  mutation CreateChatMessage(
    $orgId: ID!
    $sessionId: ID!
    $input: CreateChatMessageInput!
  ) {
    createChatMessage(orgId: $orgId, sessionId: $sessionId, input: $input) {
      id
      chatSessionId
      role
      content
      createdAt
    }
  }
`)
