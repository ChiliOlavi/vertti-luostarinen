import { defineConfig } from 'vite';

export default defineConfig({
  // Workaround for hydra-synth dependency expecting Node `global`
  define: {
    global: {},
  },
  server: {
    port: 5173
  }
});
