import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'https://speclynx.github.io/apidom/',
  plugins: [react()],
  server: {
    port: 3000,
    sourcemap: false,
    sourcemapExcludeSources: true,
  },
  worker: {
    format: 'es',
  },
  build: {
    sourcemap: false,
    sourcemapExcludeSources: true,
    target: 'esnext',
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: { format: 'es' },
      external: ['fs', 'fs/promises', 'path', 'module'],
      onwarn(warning, warn) {
        if (warning.message.includes('Use of eval')) return;
        if (warning.message.includes('has been externalized for browser compatibility')) return;
        warn(warning);
      },
    },
  },
});
