import { CodegenConfig } from '@graphql-codegen/cli'

export default {
  schema: 'https://api.dev.uigraph.app/graphql/query',
  documents: ['./src/**/*.{ts,tsx}'],

  generates: {
    './src/api/.gql/': {
      preset: 'client',

      presetConfig: {
        fragmentMasking: false,
      },

      config: {
        skipTypename: true,
        skipTypeNameForRoot: true,

        scalars: {
          DateTime: 'string',
          SanitizedString: 'string',
        },
      },
    },
  },
} satisfies CodegenConfig
