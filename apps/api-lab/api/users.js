const NAMES = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Barbara Liskov',
  'Donald Knuth',
];

export default function handler(req, res) {
  const limit = Math.min(Number(req.query.limit ?? 3) || 3, NAMES.length);

  console.log('[users] listing', { limit });

  res.status(200).json({
    ok: true,
    fn: 'users',
    count: limit,
    users: NAMES.slice(0, limit).map((name, i) => ({
      id: i + 1,
      name,
      email: `user${i + 1}@example.com`,
    })),
  });
}
