import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        hmr: {
            host: '192.168.3.22',
        },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/recharts')) {
                        return 'recharts';
                    }
                    if (id.includes('node_modules/lucide-react')) {
                        return 'lucide';
                    }
                    if (id.includes('node_modules/@inertiajs')) {
                        return 'inertia';
                    }
                },
            },
        },
    },
});
