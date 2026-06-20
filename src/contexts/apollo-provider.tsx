'use client'

import { clientV2 } from '@/api-v2/client'
import { ApolloProvider } from '@apollo/client'
import { PropsWithChildren } from 'react'

export function ApolloClientProvider({ children }: PropsWithChildren) {
  return <ApolloProvider client={clientV2}>{children}</ApolloProvider>
}
