import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.jpg', 'splash.jpg', 'apple-touch-icon.jpg'],
        manifest: {
          name: 'Kanyoza Systems AI Platform',
          short_name: 'Kanyoza',
          description: 'Enterprise AI Command Console',
          theme_color: '#0A0E1A',
          background_color: '#0A0E1A',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'icon.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Allow all Replit proxy hosts — the preview pane uses a proxied iframe
      // with a different origin, so a fixed hostname allowlist would break the preview.
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
