import {
  ApolloClient,
  DefaultOptions,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const graphqlEndpoint =
  process.env.NEXT_PUBLIC_V2_GRAPHQL_ENDPOINT ?? '/graphql'

const httpLink = new HttpLink({
  uri: graphqlEndpoint,
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

export const v2Client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions,
})
