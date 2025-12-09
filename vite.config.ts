import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path"; // Importo 'path' per gestire correttamente i percorsi

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
      "@": path.resolve(__dirname, "src"), // Alias corretto per Vite
    },
  },
}));
