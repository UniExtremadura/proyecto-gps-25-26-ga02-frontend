// NovaTune/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Usuarios -> 8000
            '/api/users': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/users/, '/api/v1'),
            },
            // Contenidos -> 8001
            '/api/content': {
                target: 'http://127.0.0.1:8001',
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/content/, '/api/v1'),
            },
            // Estadísticas -> 8002
            '/api/stats': {
                target: 'http://127.0.0.1:8002',
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/stats/, '/api/v1/stats'),
            },
            // Pagos  -> 8003
            '/api/payments': {
                target: 'http://127.0.0.1:8003',
                changeOrigin: true,
                // Transforma "/api/payments/cart" -> "/api/v1/cart"
                rewrite: (p) => p.replace(/^\/api\/payments/, '/api/v1'),
            },
        },
    },
})