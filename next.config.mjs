// next.config.mjs
import nextPWA from '@ducanh2912/next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  register: true, // plugin option
  workboxOptions: {
    // Workbox (GenerateSW) options:
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        // cache navigations/HTML
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: { cacheName: 'html-cache' },
      },
      {
        // cache static assets
        urlPattern: ({ request }) =>
          ['style', 'script', 'worker', 'image', 'font'].includes(request.destination),
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'static-assets' },
      },
    ],
  },
});

const nextConfig = { reactStrictMode: true };

export default withPWA(nextConfig);
