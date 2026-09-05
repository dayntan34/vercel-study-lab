import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Emit a manifest + sourcemaps so the deployment's Source tab has
    // interesting build output to browse.
    sourcemap: true,
    manifest: true,
  },
});
