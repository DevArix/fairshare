import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  optimizeDeps: {
    noDiscovery: true,
    include: []
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          if (id.includes('node_modules')) return 'vendor'
        }
      }
    }
  },
  server: {
    port: 5173
  }
})
