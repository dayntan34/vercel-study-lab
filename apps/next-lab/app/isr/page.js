// Incremental Static Regeneration — shows up under Settings > Data Cache
// and gives the Observability tab cache HIT/MISS data to chart.
export const revalidate = 60;

export default async function ISRPage() {
  const builtAt = new Date().toISOString();
  return (
    <section>
      <h2>ISR page</h2>
      <p>
        Regenerated at most once every 60 seconds. Rendered at{' '}
        <code>{builtAt}</code>.
      </p>
      <a href="/" style={{ color: '#3b82f6' }}>
        ← back
      </a>
    </section>
  );
}
