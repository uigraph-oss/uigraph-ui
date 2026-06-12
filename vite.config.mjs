import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

const __dirname = new URL('.', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1'
)

// Next.js exposes static image imports as objects ({ src, height, width }).
// Vite resolves them to plain URL strings, so wrap them to keep `.src` working.
function nextStaticAssets() {
  const exts = /\.(png|jpe?g|gif|svg|webp|avif)$/

  return {
    name: 'next-static-assets',
    enforce: 'post',
    transform(code, id) {
      const [filePath] = id.split('?')
      if (id.includes('?')) return null
      if (!exts.test(filePath)) return null
      if (!code.includes('export default')) return null

      const wrapped =
        code.replace('export default', 'const __assetUrl =') +
        '\nexport default { src: __assetUrl, height: 0, width: 0, blurDataURL: __assetUrl }'

      return { code: wrapped, map: null }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'NEXT_PUBLIC_')

  return {
    plugins: [react(), tailwindcss(), nextStaticAssets()],

    define: {
      'process.env': JSON.stringify({
        ...env,
        NODE_ENV: mode === 'production' ? 'production' : 'development',
      }),
    },

    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },

    server: {
      port: process.env.PORT || 3000,

      proxy: {
        '/api': {
          // eslint-disable-next-line no-undef
          target: process.env.VITE_API_TARGET ?? 'http://127.0.0.1:8080',
          changeOrigin: true,
        },

        '/graphql': {
          // eslint-disable-next-line no-undef
          target: process.env.VITE_GRAPHQL_TARGET ?? 'http://127.0.0.1:8090',
          changeOrigin: true,
        },
      },
    },
  }
})
