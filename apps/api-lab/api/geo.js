// Edge function. Listed separately from the Node handlers in the
// deployment's Functions table, with a different region model.
export const config = { runtime: 'edge' };

export default function handler(request) {
  const h = request.headers;
  console.log('[geo] invoked');

  return new Response(
    JSON.stringify(
      {
        ok: true,
        fn: 'geo',
        runtime: 'edge',
        city: h.get('x-vercel-ip-city') ?? 'unknown',
        country: h.get('x-vercel-ip-country') ?? 'unknown',
        region: h.get('x-vercel-ip-country-region') ?? 'unknown',
        latitude: h.get('x-vercel-ip-latitude') ?? null,
        longitude: h.get('x-vercel-ip-longitude') ?? null,
      },
      null,
      2
    ),
    { headers: { 'content-type': 'application/json' } }
  );
}
