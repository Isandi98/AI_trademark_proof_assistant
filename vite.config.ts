import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Para GitHub Pages, el base path es el nombre del repositorio
    // Cambia 'ai-trademark-proof-assistant' por el nombre real de tu repositorio
    const base = mode === 'production' ? '/ai-trademark-proof-assistant/' : '/';
    
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
