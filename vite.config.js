import { defineConfig } from 'vite';
import path from 'path';

// Default to root for a custom domain deployment.
// Can be overridden with BASE_URL or VITE_BASE when needed.
const repoBase = process.env.BASE_URL || process.env.VITE_BASE || '/';

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
