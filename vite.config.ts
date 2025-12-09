import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/FNAF-GAME-SITE/", // fondamentale per GitHub Pages
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" ? componentTagger() : undefined,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": "/src", // alias semplice e funzionante in Vite
    },
  },
}));
