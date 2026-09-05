// Forced dynamic rendering: every request hits a function, so this route
// reliably produces Runtime Logs entries.
export const dynamic = 'force-dynamic';

export default async function DynamicPage() {
  return (
    <section>
      <h2>Dynamic page</h2>
      <p>
        Server-rendered per request at <code>{new Date().toISOString()}</code>.
      </p>
      <p style={{ color: '#a1a1a1', fontSize: 13 }}>
        Served from <code>{process.env.VERCEL_REGION ?? 'local'}</code>.
      </p>
      <a href="/" style={{ color: '#3b82f6' }}>
        ← back
      </a>
    </section>
  );
}
