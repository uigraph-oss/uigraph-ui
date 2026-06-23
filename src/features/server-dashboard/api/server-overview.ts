import { graphql } from '@/api'

export const SERVER_OVERVIEW = graphql(`
  query ServerOverview {
    serverOverview {
      totalUsers
      activeUsers
      totalOrgs
    }
    serverConfig {
      storageBackend
      storageBucket
      storageEndpoint
      vectorBackend
      embeddingBackend
      embeddingModel
    }
  }
`)
