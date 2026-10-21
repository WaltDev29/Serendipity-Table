import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'window',
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true
    },
    allowedHosts: [
      'serendipity-table.aikopo.net',
      '.aikopo.net',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://backend:8080',
        changeOrigin: true
      },
      '/ws-chat': {
        target: 'http://backend:8080',
        ws: true
      }
    }
  }
})
