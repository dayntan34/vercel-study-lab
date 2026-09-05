export const dynamic = 'force-dynamic';

export async function GET(request) {
  // console output lands in the dashboard's Runtime Logs
  console.log('[hello] invoked', {
    url: request.url,
    region: process.env.VERCEL_REGION,
  });

  return Response.json({
    ok: true,
    route: '/api/hello',
    runtime: 'nodejs',
    region: process.env.VERCEL_REGION ?? 'local',
    target: process.env.STUDY_LAB_TARGET ?? 'unset',
    timestamp: new Date().toISOString(),
  });
}
