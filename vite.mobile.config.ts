import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'mobile',
  base: './',
  plugins: [react()],
  build: {
    outDir: '../www',
    emptyOutDir: true,
  },
});
