import { defineConfig } from 'vite';

export default defineConfig({
  base: '/REPO_NAME/',
  define: { global: {} },
  server: { port: 5173 }
});