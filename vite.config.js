import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 配置增加API代理
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
