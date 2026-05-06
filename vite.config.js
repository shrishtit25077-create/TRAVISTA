import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Ensures all assets use absolute paths from root — required for Vercel SPA
  base: '/',

  server: {
    port: 5173,
    strictPort: true,
  },

  build: {
    outDir: 'dist',
    // Emit a warning rather than an error for large chunks (our app is intentionally large)
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Split vendor chunks — rolldown (Vite 8) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/framer-motion/')) {
            return 'framer';
          }
          if (id.includes('node_modules/firebase/')) {
            return 'firebase';
          }
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'leaflet';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2')) {
            return 'charts';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
        },
      },
    },
  },

  // Ensure absolute imports from /src work in production
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // Suppress noisy dev warnings
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  },
});
