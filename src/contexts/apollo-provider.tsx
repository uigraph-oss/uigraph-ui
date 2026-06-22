'use client'

import { apolloClientGQL } from '@/api/client'
import { ApolloProvider } from '@apollo/client'
import { PropsWithChildren } from 'react'

export function ApolloClientProvider({ children }: PropsWithChildren) {
  return <ApolloProvider client={apolloClientGQL}>{children}</ApolloProvider>
}
