import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // dimensions: false strips width/height attrs so Tailwind w-[N%] in
    // className controls size and the SVG's viewBox derives the height.
    svgr({ svgrOptions: { dimensions: false } }),
  ],
})
