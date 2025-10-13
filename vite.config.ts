import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: { 
    alias: { 
      '@': fileURLToPath(new URL('./src', import.meta.url)) 
    } 
  },
  server: {
    port: 5173,
    proxy: {
      // /api로 시작하는 모든 요청을 백엔드로 프록시
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // 로깅 추가 (디버깅용)
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
          });
        },
      }
    }
  }
})