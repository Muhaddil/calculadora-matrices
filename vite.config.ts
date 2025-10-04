import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: "/calculadora-matrices/",
  plugins: [react()],
  optimizeDeps: {
    include: ['katex', 'react-katex']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));