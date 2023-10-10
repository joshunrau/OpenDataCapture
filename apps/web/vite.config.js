// @ts-check

import path from 'path';
import url from 'url';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

const projectDir = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer]
      }
    },
    // Note: This is for bun imports, which are currently broken
    // optimizeDeps: {
    //   esbuildOptions: {
    //     jsx: 'automatic'
    //   }
    // },
    plugins: [react(), viteCompression()],
    server: {
      port: parseInt(process.env.WEB_DEV_SERVER_PORT ?? '3000'),
      proxy: {
        '/api/': {
          target: {
            host: 'localhost',
            port: parseInt(process.env.API_DEV_SERVER_PORT ?? '5500')
          },
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(projectDir, 'src')
      }
    }
  };
});