import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  base: "/calculadora-matrices/",
  plugins: [react()],
  optimizeDeps: {
    include: ["katex", "react-katex", "mathjs"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("katex") || id.includes("react-katex")) {
            return "katex";
          }
          if (id.includes("mathjs")) {
            return "mathjs";
          }
        }
      }
    }
  }
}));