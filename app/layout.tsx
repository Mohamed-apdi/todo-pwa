import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Todo PWA',
  description: 'Offline-capable Todo app',
  applicationName: 'Todo PWA',
  manifest: '/manifest.webmanifest', // Next will serve manifest.ts as this URL
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
