export const dynamic = 'force-dynamic';

// Roughly a third of calls fail, giving the dashboard a non-zero error rate
// and populating the "Errors" view with real stack traces.
export async function GET() {
  const roll = Math.random();

  if (roll < 0.34) {
    console.error('[error] intentional failure', { roll });
    throw new Error(
      `Intentional study-lab failure (roll=${roll.toFixed(3)}). This is expected.`
    );
  }

  if (roll < 0.5) {
    console.warn('[error] returning 503', { roll });
    return Response.json(
      { ok: false, reason: 'simulated upstream unavailable' },
      { status: 503 }
    );
  }

  return Response.json({ ok: true, route: '/api/error', roll });
}
