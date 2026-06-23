import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// base: "./" keeps asset + data paths relative so the production build is portable
// when served locally from any folder (laptop/projector use case).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("/d3-") || id.includes("victory"))
            return "charts";
          if (id.includes("react-simple-maps") || id.includes("topojson")) return "map";
          return "vendor";
        },
      },
    },
  },
});
