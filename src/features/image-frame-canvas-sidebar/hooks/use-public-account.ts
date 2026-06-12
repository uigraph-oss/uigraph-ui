import { useQuery } from '@apollo/client'
import { GET_PUBLIC_ACCOUNT_INFO } from '../api/account'

export function usePublicAccount(accountId: string | undefined | null) {
  const { data, loading } = useQuery(GET_PUBLIC_ACCOUNT_INFO, {
    fetchPolicy: 'cache-first',
    variables: { accountId: accountId! },
    skip: !accountId,
  })

  const accountInfo = data?.GetPubAccountByID?.accountInfo
  return {
    ...accountInfo,

    name: accountInfo
      ? [accountInfo?.firstName?.trim(), accountInfo?.lastName?.trim()]
          .filter(Boolean)
          .join(' ')
      : null,

    avatarSrc: accountInfo?.imageUrl || accountInfo?.image,

    isLoading: loading,
  }
}
