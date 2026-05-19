import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group recharts and d3 packages together
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            // Group react-icons separately
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            // All other standard dependencies
            return 'vendor-core';
          }
        },
      },
    },
  },
});
