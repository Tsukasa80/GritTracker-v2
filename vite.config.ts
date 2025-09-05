import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  root: path.resolve(__dirname),
  base: command === 'serve' ? '/' : '/GritTracker-v2/', // 開発時は '/'、GitHub Pages時は '/GritTracker-v2/'
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // ファイル名に内容ベースのハッシュを生成
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  server: {
    host: true, // ネットワークアクセスを許可
    port: 5174, // PomodoroTimerと重複を避けるため
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}))