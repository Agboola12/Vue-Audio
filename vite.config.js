import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


export default defineConfig ({
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['onnxruntime-web'],
  },
    plugins: [vue()],
  });
  
  // https://vitejs.dev/config/
  // export default defineConfig({
    // plugins: [vue()],
// })


