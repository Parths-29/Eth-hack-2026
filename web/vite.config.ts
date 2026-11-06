import { defineConfig } from 'vite';
import {fileURLToPath,URL} from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},envPrefix:["VITE_","NEXT_PUBLIC_"],plugins: [react(), tailwindcss()] });
