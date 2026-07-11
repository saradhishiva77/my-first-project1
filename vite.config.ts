import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react-router-dom',
      'framer-motion',
      'recharts',
      'jspdf',
      '@supabase/supabase-js',
    ],
    exclude: ['lucide-react'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
