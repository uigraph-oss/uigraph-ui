import { graphql } from '@/api'

export const ME_V2 = graphql(`
  query MeV2 {
    me {
      userId
      name
      avatarUrl
    }
  }
`)
