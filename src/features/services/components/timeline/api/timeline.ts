import { graphql } from '@/api'

export const SERVICE_TIMELINE_EVENTS = graphql(`
  query ServiceTimelineEvents($orgId: ID!, $serviceId: ID!) {
    serviceTimelineEvents(orgId: $orgId, serviceId: $serviceId) {
      id
      serviceId
      type
      title
      summary
      eventDate
      version
      adrNumber
      decisionStatus
      sourceLabel
      sourceUrl
      isAgentSummarized
      origin
      touches {
        id
        label
        kind
      }
      attachmentAssetId
      attachmentFileName
      attachmentFileType
      attachmentUrl
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_TIMELINE_EVENT = graphql(`
  mutation CreateTimelineEvent(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateTimelineEventInput!
  ) {
    createTimelineEvent(orgId: $orgId, serviceId: $serviceId, input: $input) {
      id
      serviceId
      type
      title
      summary
      eventDate
      version
      adrNumber
      decisionStatus
      sourceLabel
      sourceUrl
      isAgentSummarized
      origin
      touches {
        id
        label
        kind
      }
      attachmentAssetId
      attachmentFileName
      attachmentFileType
      attachmentUrl
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_TIMELINE_EVENT = graphql(`
  mutation UpdateTimelineEvent(
    $orgId: ID!
    $serviceId: ID!
    $eventId: ID!
    $input: UpdateTimelineEventInput!
  ) {
    updateTimelineEvent(
      orgId: $orgId
      serviceId: $serviceId
      eventId: $eventId
      input: $input
    ) {
      id
      serviceId
      type
      title
      summary
      eventDate
      version
      adrNumber
      decisionStatus
      sourceLabel
      sourceUrl
      isAgentSummarized
      origin
      touches {
        id
        label
        kind
      }
      attachmentAssetId
      attachmentFileName
      attachmentFileType
      attachmentUrl
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_TIMELINE_EVENT = graphql(`
  mutation DeleteTimelineEvent($orgId: ID!, $serviceId: ID!, $eventId: ID!) {
    deleteTimelineEvent(orgId: $orgId, serviceId: $serviceId, eventId: $eventId)
  }
`)
