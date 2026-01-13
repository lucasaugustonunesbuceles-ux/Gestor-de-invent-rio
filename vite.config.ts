
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injeta a variável de ambiente durante o build para que process.env.API_KEY funcione no cliente
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
