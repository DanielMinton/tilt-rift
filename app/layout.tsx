import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TILT//RIFT - Signalrunner',
  description: 'A dual-platform physics-based web game. Tilt to guide the orb through crystalline void-scapes.',
  keywords: ['game', 'physics', 'tilt', 'webgl', 'three.js', 'puzzle'],
  authors: [{ name: 'TILT//RIFT Team' }],
  openGraph: {
    title: 'TILT//RIFT - Signalrunner',
    description: 'Tilt to guide the orb through crystalline void-scapes',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TILT//RIFT - Signalrunner',
    description: 'Tilt to guide the orb through crystalline void-scapes',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#07060D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-void text-white overflow-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
