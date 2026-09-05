// Reflects the request back, including the x-vercel-* headers the platform
// injects. Handy for understanding what the edge adds to every request.
export default function handler(req, res) {
  const vercelHeaders = Object.fromEntries(
    Object.entries(req.headers).filter(([k]) => k.startsWith('x-vercel-'))
  );

  console.log('[echo] invoked', { method: req.method });

  res.status(200).json({
    ok: true,
    fn: 'echo',
    method: req.method,
    url: req.url,
    query: req.query,
    vercelHeaders,
    userAgent: req.headers['user-agent'] ?? null,
  });
}
