// Mixed status codes so the dashboard's status-code breakdown chart
// has more than one colour in it.
export default function handler(req, res) {
  const roll = Math.random();

  if (roll < 0.15) {
    console.error('[flaky] 500', { roll });
    res.status(500).json({ ok: false, fn: 'flaky', code: 500 });
    return;
  }
  if (roll < 0.25) {
    console.warn('[flaky] 429', { roll });
    res.setHeader('retry-after', '30');
    res.status(429).json({ ok: false, fn: 'flaky', code: 429 });
    return;
  }
  if (roll < 0.35) {
    console.warn('[flaky] 404', { roll });
    res.status(404).json({ ok: false, fn: 'flaky', code: 404 });
    return;
  }

  console.log('[flaky] 200', { roll });
  res.status(200).json({ ok: true, fn: 'flaky', code: 200 });
}
