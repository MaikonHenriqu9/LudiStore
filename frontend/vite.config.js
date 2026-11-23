import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Em desenvolvimento, toda chamada para /api vai para o Django (porta 8000).
    // Assim o navegador acha que é o mesmo endereço e o CORS não bloqueia.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
