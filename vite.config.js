import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Savi Billing", // App ka naam
        short_name: "Billing",
        description: "Sales and Billing App",
        theme_color: "#16A34A", // Green theme color
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png", 
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png", 
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
    ,
    tailwindcss(),
  ],
});
