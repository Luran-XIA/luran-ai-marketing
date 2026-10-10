import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({plugins:[react()], base:"./", build:{outDir:".build", rollupOptions:{input:"source.html"}, cssCodeSplit:false, assetsInlineLimit:1000000}});
