import { graphql } from '@/api'

export const ME = graphql(`
  query MeV2 {
    me {
      userId
      name
      avatarUrl
    }
  }
`)
