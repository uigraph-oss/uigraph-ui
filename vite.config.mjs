import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

const __dirname = new URL('.', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1'
)

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },

    optimizeDeps: {
      include: ['@apollo/client', 'graphql'],
    },

    server: {
      host: true,
      port: process.env.PORT || 3000,
      allowedHosts: ['host.docker.internal', 'localhost', 'uigraph-ui'],

      proxy: {
        '/api': {
          target: process.env.VITE_API_TARGET ?? 'http://127.0.0.1:8080',
          changeOrigin: true,
        },

        '/graphql': {
          target: process.env.VITE_GRAPHQL_TARGET ?? 'http://127.0.0.1:8090',
          changeOrigin: true,
        },
      },
    },
  }
})
