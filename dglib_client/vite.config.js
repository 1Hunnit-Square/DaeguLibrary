import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    host: true, // 외부 접속 허용
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      }
    }
  }
})