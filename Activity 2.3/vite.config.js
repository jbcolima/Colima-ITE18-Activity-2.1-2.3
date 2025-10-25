import { defineConfig } from 'vite'
import restart from 'vite-plugin-restart'

export default defineConfig({
  root: 'src/', // Sources files (typically where index.html is)
  publicDir: '../static/', // Path from "root" to static assets
  base: './', // ✅ use relative URLs instead of absolute ones
  server: {
    host: true, // Open to local network and display URL
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
  },
  build: {
    outDir: '../dist', // Output folder
    emptyOutDir: true,
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  plugins: [
    restart({ restart: ['../static/**'] })
  ]
})
