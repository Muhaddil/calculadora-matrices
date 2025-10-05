import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: "/calculadora-matrices/",
  plugins: [react()],
  optimizeDeps: {
    include: ['katex', 'react-katex', 'mathjs']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          katex: ['katex', 'react-katex'],
          mathjs: ['mathjs']
        }
      }
    }
  }
}));
