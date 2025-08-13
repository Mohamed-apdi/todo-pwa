// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Todo PWA',
    short_name: 'Todo',
    description: 'Offline-capable Todo app',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111827',
    icons: [
      { src: '/todo/public/icon/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/todo/public/icon/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/todo/public/icon/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
