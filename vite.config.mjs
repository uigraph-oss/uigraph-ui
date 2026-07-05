import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

const __dirname = new URL('.', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1'
)

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],

    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },

    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },

    optimizeDeps: {
      include: ['@apollo/client', 'graphql'],
      esbuildOptions: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
    },

    server: {
      host: true,
      port: process.env.PORT || 3000,
      allowedHosts: true,
      proxy: {
        '/api': { target: process.env.API_URL, changeOrigin: true },
        '/graphql': { target: process.env.GRAPHQL_URL, changeOrigin: true },
      },
    },

    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
