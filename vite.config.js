import { defineConfig } from 'vite';
import path from 'path';

// For GitHub Pages (project site) we need to set `base` so built asset
// URLs include the repository name. This can be overridden with the
// environment variable `BASE_URL` or `VITE_BASE` when building.
const repoBase = process.env.BASE_URL || process.env.VITE_BASE || '/vertti-luostarinen/';

export default defineConfig({
  base: repoBase,
  build: {
    rollupOptions: {
      // Include additional HTML pages so Vite will treat them as entry points
      input: {
        main: path.resolve(__dirname, 'index.html'),
        about: path.resolve(__dirname, 'about.html'),
        feed: path.resolve(__dirname, 'feed.html'),
        blog: path.resolve(__dirname, 'blog.html'),
        post: path.resolve(__dirname, 'post.html')
      }
    }
  },
  // Workaround for hydra-synth dependency expecting Node `global`
  define: {
    global: {},
  },
  server: {
    port: 5173
  }
});
