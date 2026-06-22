import { graphql } from '@/api'

export const ME = graphql(`
  query Me {
    me {
      userId
      name
      avatarUrl
    }
  }
`)
