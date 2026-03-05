import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Base path para GitHub Pages
  // Cambiar '/EcoResource_Connect/' por '/' si usas dominio personalizado
  base: process.env.VITE_BASE_PATH || '/',
  
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimizaciones para producción
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['leaflet', 'react-leaflet', 'recharts']
        }
      }
    }
  }
})
