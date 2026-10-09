import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { rollupOptions: { input: {
    studio: fileURLToPath(new URL('./index.html', import.meta.url)),
    renderDemo: fileURLToPath(new URL('./render-demo.html', import.meta.url)),
  } } },
});
