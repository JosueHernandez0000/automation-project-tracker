import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// base: "./" keeps asset + data paths relative so the production build is portable
// when served locally from any folder (laptop/projector use case).
//
// `--mode standalone` (npm run build:standalone) inlines all JS + CSS into a single
// index.html in dist-standalone/. The Python `create-html` command then embeds the
// data + map geometry into it, producing one shareable file (email / Teams / SharePoint).
export default defineConfig(({ mode }) => {
  const standalone = mode === "standalone";
  return {
    base: "./",
    plugins: [react(), tailwindcss(), ...(standalone ? [viteSingleFile()] : [])],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // Data + geo are embedded by the Python step, so /public isn't copied.
    publicDir: standalone ? false : "public",
    build: standalone
      ? { outDir: "dist-standalone" }
      : {
          rollupOptions: {
            output: {
              manualChunks(id: string) {
                if (!id.includes("node_modules")) return;
                if (id.includes("recharts") || id.includes("/d3-") || id.includes("victory"))
                  return "charts";
                if (id.includes("react-simple-maps") || id.includes("topojson")) return "map";
                return "vendor";
              },
            },
          },
        },
  };
});
