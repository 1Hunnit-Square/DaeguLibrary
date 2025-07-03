import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [react(), tailwindcss()],
   server: {
     https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/private.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/certificate.crt')),
      ca: fs.readFileSync(path.resolve(__dirname, 'certs/ca_bundle.crt')),
    },
    host: true, // 외부 접속 허용
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
