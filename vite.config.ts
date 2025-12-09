import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/FNAF-GAME-SITE/", // Questo è fondamentale per GitHub Pages, il nome del repository
  server: {
    host: "::", // Opzione per connettersi a tutte le interfacce di rete (utile in ambienti di sviluppo)
    port: 8080, // La porta su cui il server di sviluppo verrà eseguito (opzionale)
  },
  plugins: [
    react(), // Abilita il supporto per React (SWC è una versione più veloce di Babel per la compilazione di React)
    mode === "development" ? componentTagger() : undefined, // Aggiungi `componentTagger` solo in modalità sviluppo
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": "/src", // Alias per importare facilmente i file dalla cartella src
    },
  },
  build: {
    outDir: "dist", // La cartella di output del build
  },
}));
