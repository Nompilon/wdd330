import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        meals: resolve(__dirname, "src/recipes/index.html"),
        about: resolve(__dirname, "src/about/index.html"),
        track: resolve(__dirname, "src/tracker/index.html"),
      },
    },
    emptyOutDir: true,
  },
});
