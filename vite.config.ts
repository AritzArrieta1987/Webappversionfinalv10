
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'sonner@2.0.3': 'sonner',
        'figma:asset/aa0296e2522220bcfcda71f86c708cb2cbc616b9.png': path.resolve(__dirname, './src/assets/aa0296e2522220bcfcda71f86c708cb2cbc616b9.png'),
        'figma:asset/0a2a9faa1b59d5fa1e388a2eec5b08498dd7a493.png': path.resolve(__dirname, './src/assets/0a2a9faa1b59d5fa1e388a2eec5b08498dd7a493.png'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });