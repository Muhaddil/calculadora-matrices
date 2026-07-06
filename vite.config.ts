import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  base: "/calculadora-matrices/",
  plugins: [react()],
  optimizeDeps: {
    include: ["katex", "mathjs"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("katex")) return "katex";
          if (id.includes("mathjs")) return "mathjs";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("react-router")) return "router";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
}));
