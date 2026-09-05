import { get, getAll } from '@vercel/edge-config';

// Reads the Edge Config store attached to this project via the
// EDGE_CONFIG connection string in project settings.
export const dynamic = 'force-dynamic';

export default async function FlagsPage() {
  let items = null;
  let error = null;

  try {
    items = await getAll();
  } catch (e) {
    error = e.message;
  }

  return (
    <section>
      <h2>Edge Config flags</h2>
      {error ? (
        <p style={{ color: '#f87171' }}>
          Could not read Edge Config: <code>{error}</code>
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, color: '#a1a1a1' }}>Key</th>
              <th style={{ textAlign: 'left', padding: 8, color: '#a1a1a1' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(items ?? {}).map(([k, v]) => (
              <tr key={k} style={{ borderTop: '1px solid #262626' }}>
                <td style={{ padding: 8 }}>
                  <code>{k}</code>
                </td>
                <td style={{ padding: 8, color: '#a1a1a1' }}>
                  <code>{JSON.stringify(v)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ marginTop: 24 }}>
        <a href="/" style={{ color: '#3b82f6' }}>
          ← back
        </a>
      </p>
    </section>
  );
}
