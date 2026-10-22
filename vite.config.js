import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The relative base works on both username.github.io/repo and custom domains.
export default defineConfig({ plugins: [react()], base: './', build: { sourcemap: false } });
