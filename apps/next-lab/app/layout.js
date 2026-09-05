import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'Next Lab — Vercel Study Lab',
  description: 'Throwaway Next.js app for exploring the Vercel dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            'ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          background: '#0a0a0a',
          color: '#ededed',
        }}
      >
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
          <header style={{ borderBottom: '1px solid #262626', paddingBottom: 16 }}>
            <h1 style={{ fontSize: 24, margin: 0 }}>next-lab</h1>
            <p style={{ color: '#a1a1a1', fontSize: 14 }}>
              Vercel Study Lab · Next.js App Router
            </p>
          </header>
          {children}
        </main>
        {/* Feeds the dashboard's Analytics and Speed Insights tabs */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
