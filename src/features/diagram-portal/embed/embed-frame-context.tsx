import { createContext } from 'daily-code/react'

type TEmbedFrameProviderProps = {
  path: string[]
  ancestors: string[]
}

type TEmbedFrameContext = {
  isEmbedded: boolean
  path: string[]
  ancestors: string[]
}

export const [EmbedFrameProvider, useEmbedFrameContext] = createContext(
  ({ path, ancestors }: TEmbedFrameProviderProps): TEmbedFrameContext => {
    return {
      isEmbedded: true,
      path,
      ancestors,
    }
  },
  {
    displayName: 'Embed Frame Context',
    initialValue: {
      isEmbedded: false,
      path: [],
      ancestors: [],
    },
  }
)
