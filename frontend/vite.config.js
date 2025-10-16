import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Enhanced build configuration
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte', '@supabase/supabase-js'],
          ui: ['lucide-svelte', 'svelte-french-toast']
        }
      }
    }
  },
  
  // Optimization settings
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'lucide-svelte']
  },
  
  // Test configuration
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['src/setupTests.js']
  }
});
