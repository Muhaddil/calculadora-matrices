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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("katex")) return "katex";
          if (id.includes("mathjs")) return "mathjs";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("react/")) return "react-vendor";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("i18next") || id.includes("react-i18next")) return "i18n";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
}));
