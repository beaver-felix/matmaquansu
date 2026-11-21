import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: { input: { game: 'index.html', artwork: 'artwork.html' } },
    target: 'es2022',
    sourcemap: false
  }
});
