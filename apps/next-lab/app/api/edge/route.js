// Edge runtime — the dashboard lists this separately from Node functions
// under Deployment > Functions, with its own memory/duration profile.
export const runtime = 'edge';

export async function GET(request) {
  console.log('[edge] invoked');

  return Response.json({
    ok: true,
    route: '/api/edge',
    runtime: 'edge',
    city: request.headers.get('x-vercel-ip-city') ?? 'unknown',
    country: request.headers.get('x-vercel-ip-country') ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}
