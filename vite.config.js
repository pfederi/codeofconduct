import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.match(/\.(png|jpe?g|svg|gif)$/)) {
            // Behalte die ursprüngliche Verzeichnisstruktur für Bilder bei
            const path = assetInfo.name.split('/');
            if (path.length > 1) {
              return `images/${path.slice(1).join('/')}`;
            }
            return `images/${assetInfo.name}`;
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
}); 