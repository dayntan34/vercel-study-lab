export const dynamic = 'force-dynamic';

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');

  if (secret && auth !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('[cron/cleanup] ran', { at: new Date().toISOString() });

  return Response.json({
    ok: true,
    job: 'cleanup',
    ranAt: new Date().toISOString(),
  });
}
