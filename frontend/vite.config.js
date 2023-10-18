import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig({
  host: true,
  port: 80,
  plugins: [react(), tailwindcss()],
});
