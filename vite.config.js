import { defineConfig } from 'vite';

// For GitHub Pages (project site) we need to set `base` so built asset
// URLs include the repository name. This can be overridden with the
// environment variable `BASE_URL` or `VITE_BASE` when building.
const repoBase = process.env.BASE_URL || process.env.VITE_BASE || '/vertti-luostarinen/';

export default defineConfig({
  base: repoBase,
  // Workaround for hydra-synth dependency expecting Node `global`
  define: {
    global: {},
  },
  server: {
    port: 5173
  }
});
