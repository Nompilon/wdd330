import { resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: "src/",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        meals: resolve(__dirname, "src/recipes/index.html"),
        about: resolve(__dirname, "src/about/index.html"),
      },
    },
    emptyOutDir: true,
  },
});
