import { graphql } from '@/api-v2'

export const ME_V2 = graphql(`
  query MeV2 {
    me {
      userId
      name
      avatarUrl
    }
  }
`)
