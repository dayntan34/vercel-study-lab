export const dynamic = 'force-dynamic';

// Cron target. Vercel sets an Authorization header built from CRON_SECRET,
// which is why that env var exists in project settings.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');

  if (secret && auth !== `Bearer ${secret}`) {
    console.warn('[cron/digest] rejected unauthorized call');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('[cron/digest] ran', { at: new Date().toISOString() });

  return Response.json({
    ok: true,
    job: 'digest',
    ranAt: new Date().toISOString(),
  });
}
