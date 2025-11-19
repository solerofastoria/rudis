import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // позволяет обращаться из Docker
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:5000', // имя сервиса backend из docker-compose.yml
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'http://backend:5000',
        changeOrigin: true,
        ws: true, // включаем поддержку WebSocket
      }
    },
  },
})
