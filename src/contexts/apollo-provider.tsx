'use client'

import { privateClient } from '@/api'
import { ApolloProvider } from '@apollo/client'
import { PropsWithChildren } from 'react'

export function ApolloClientProvider({ children }: PropsWithChildren) {
  return <ApolloProvider client={privateClient}>{children}</ApolloProvider>
}
