import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const apiBase = process.env.VITE_API_BASE // .env.local에 있으면 프록시 활성화

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { proxy: apiBase ? { '/api': { target: apiBase, changeOrigin: true } } : undefined }
})
