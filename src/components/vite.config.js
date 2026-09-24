import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";

// Numéro de version (lu dans package.json) et date du déploiement,
// affichés en bas de chaque page pour vérifier que la mise à jour est en ligne.
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));
const buildDate = new Date().toLocaleString("fr-FR", {
  timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
});

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Suivi AS by C. Guilhem",
        short_name: "Suivi AS",
        description: "Suivi des fiches d'inscription de l'Association Sportive",
        theme_color: "#111827",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/eleve",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});
