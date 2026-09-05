// CPU-bound handler. Gives the Observability tab meaningful compute time
// and memory numbers rather than everything sitting at the floor.
export default function handler(req, res) {
  const started = Date.now();
  const rounds = 2_000_000 + Math.floor(Math.random() * 3_000_000);

  let acc = 0;
  for (let i = 0; i < rounds; i++) {
    acc += Math.sqrt(i) % 7;
  }

  const durationMs = Date.now() - started;
  console.log('[heavy] finished', { rounds, durationMs });

  res.status(200).json({
    ok: true,
    fn: 'heavy',
    rounds,
    durationMs,
    checksum: Math.round(acc),
  });
}
