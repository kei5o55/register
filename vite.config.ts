import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

/*/ vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // VueならVueのプラグイン
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Service Workerを自動更新
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'マイアプリ名',
        short_name: 'アプリ',
        description: 'アプリの説明文',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        display: 'standalone', // これでブラウザのUI（URLバー等）が消えます
        orientation: 'portrait', // 画面を縦方向に固定したい場合
        background_color: '#ffffff', // 起動時のスプラッシュ画面の背景色
        theme_color: '#000000', // スマホの上部ステータスバーの色
      }
    })
  ]
})*/