import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Para Cloud Run, usamos base path raíz
    const base = '/';
    
    return {
      base,
      define: {
        // Variables de entorno para las APIs
        'import.meta.env.VITE_GOOGLE_SEARCH_API_KEY': JSON.stringify(env.VITE_GOOGLE_SEARCH_API_KEY || ''),
        'import.meta.env.VITE_GOOGLE_SEARCH_CX': JSON.stringify(env.VITE_GOOGLE_SEARCH_CX || ''),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
