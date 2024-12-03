import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Strip trailing slashes from URLs
    strictPort: true,
    fs: {
      strict: true
    }
  }
})
