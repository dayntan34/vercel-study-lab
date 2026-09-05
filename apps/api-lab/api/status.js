export default function handler(req, res) {
  console.log('[status] ok', { method: req.method });

  res.setHeader('cache-control', 'no-store');
  res.status(200).json({
    ok: true,
    service: 'api-lab',
    fn: 'status',
    region: process.env.VERCEL_REGION ?? 'local',
    env: process.env.VERCEL_ENV ?? 'local',
    now: new Date().toISOString(),
  });
}
