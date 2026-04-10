import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: 'সবার খাতা (Sobar Khata)',
            short_name: 'সবার খাতা',
            description: 'ডিজিটাল হিসাব খাতা - কাস্টমার লেনদেন ট্র্যাকার',
            theme_color: '#006A4E',
            icons: [
              {
                src: 'https://picsum.photos/192/192?grayscale',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'https://picsum.photos/512/512?grayscale',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
