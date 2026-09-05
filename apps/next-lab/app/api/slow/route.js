export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Deliberately variable latency so the Observability duration percentiles
// (p50/p75/p99) have a real spread instead of a flat line.
export async function GET() {
  const delay = 150 + Math.floor(Math.random() * 1200);
  const started = Date.now();

  await new Promise((resolve) => setTimeout(resolve, delay));

  console.log('[slow] completed', { requestedDelayMs: delay });

  return Response.json({
    ok: true,
    route: '/api/slow',
    requestedDelayMs: delay,
    actualDurationMs: Date.now() - started,
  });
}
