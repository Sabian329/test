import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // nasłuchuj na wszystkich interfejsach (w tym WiFi)
    port: 5173,
  },
})
