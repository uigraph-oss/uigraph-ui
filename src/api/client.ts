import {
  ApolloClient,
  DefaultOptions,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import { env } from '@/env'

const httpLink = new HttpLink({
  uri: env.VITE_GRAPHQL_ENDPOINT,
  credentials: 'include',
})

const authLink = setContext((_operation, { headers }) => {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('uigraph_token')
      : null
  if (!token) return { headers }
  return { headers: { ...headers, Authorization: `Bearer ${token}` } }
})

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

export const apolloClientGQL = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions,
})
