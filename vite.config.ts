import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // API da planilha (server/index.mjs) — rode "npm run dev:server" junto com "npm run dev".
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
