import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.GOOGLE_CLIENT_ID': `"${process.env.VITE_GOOGLE_CLIENT_ID}"`,
    'process.env.API_KEY': `"${process.env.VITE_API_KEY}"`,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000
  },
})