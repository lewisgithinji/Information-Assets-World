import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Gzip compression for production
    mode === "production" && compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression for production (better compression ratio)
    mode === "production" && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and core libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI components chunk
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          // Charts chunk (only loaded on admin pages)
          'vendor-charts': ['recharts'],
          // Rich text editor chunk (only loaded on admin pages)
          'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit'],
          // Supabase chunk
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning limit (we're code splitting, so larger chunks are OK)
    chunkSizeWarningLimit: 1000,
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: mode === 'development',
  },
}));
