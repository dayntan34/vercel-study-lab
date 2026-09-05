#!/usr/bin/env node
/**
 * Drives synthetic traffic at the study-lab deployments so the Vercel
 * dashboard has real data in Observability, Runtime Logs, Firewall and the
 * status-code breakdowns.
 *
 * Usage:  node scripts/generate-traffic.mjs [totalRequests] [concurrency]
 */

const NEXT = 'https://next-lab-acme-415b1.vercel.app';
const API = 'https://api-lab-acme-415b1.vercel.app';
const STATIC = 'https://static-lab-acme-415b1.vercel.app';
const VITE = 'https://vite-lab-acme-415b1.vercel.app';

// [url, weight] — higher weight means the path is requested more often,
// which produces a realistic long-tail distribution rather than a flat one.
const TARGETS = [
  [`${NEXT}/`, 10],
  [`${NEXT}/isr`, 6],
  [`${NEXT}/dynamic`, 5],
  [`${NEXT}/flags`, 4],
  [`${NEXT}/api/hello`, 6],
  [`${NEXT}/api/edge`, 5],
  [`${NEXT}/api/slow`, 3],
  [`${NEXT}/api/error`, 4],
  [`${NEXT}/old-pricing`, 2],
  [`${NEXT}/proxy-health`, 2],
  [`${NEXT}/?debug=1`, 2], // matches the log-only firewall rule
  [`${NEXT}/admin`, 2], // matches the deny firewall rule
  [`${NEXT}/does-not-exist`, 2], // 404s
  [`${API}/api/status`, 8],
  [`${API}/api/users?limit=5`, 5],
  [`${API}/api/heavy`, 2],
  [`${API}/api/flaky`, 6],
  [`${API}/api/geo`, 5],
  [`${API}/api/echo?source=study-lab`, 4],
  [`${API}/health`, 3],
  [`${STATIC}/`, 7],
  [`${STATIC}/about`, 4],
  [`${STATIC}/docs`, 2],
  [`${STATIC}/nope`, 2],
  [`${VITE}/`, 6],
  [`${VITE}/deep/link`, 3],
];

const AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36',
];

const REFERRERS = [
  'https://www.google.com/',
  'https://news.ycombinator.com/',
  'https://x.com/',
  'https://github.com/dayntan34/vercel-study-lab',
  '',
];

// Expand the weighted list into a flat pool for cheap random selection.
const POOL = TARGETS.flatMap(([url, weight]) => Array(weight).fill(url));

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const total = Number(process.argv[2] ?? 600);
const concurrency = Number(process.argv[3] ?? 12);

const stats = { byStatus: {}, byHost: {}, errors: 0, done: 0 };
let cursor = 0;

async function worker(id) {
  while (cursor < total) {
    const n = cursor++;
    if (n >= total) break;

    const url = pick(POOL);
    const host = new URL(url).host.split('-acme')[0];

    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': pick(AGENTS),
          referer: pick(REFERRERS),
          'accept-language': pick(['en-US,en;q=0.9', 'en-GB,en;q=0.8', 'si-LK,si;q=0.9']),
        },
        redirect: 'manual',
      });
      stats.byStatus[res.status] = (stats.byStatus[res.status] ?? 0) + 1;
      stats.byHost[host] = (stats.byHost[host] ?? 0) + 1;
      await res.arrayBuffer();
    } catch {
      stats.errors++;
    }

    stats.done++;
    if (stats.done % 50 === 0) {
      process.stdout.write(`  ${stats.done}/${total}\r`);
    }

    // Jitter keeps the request timeline from looking like a single spike.
    await new Promise((r) => setTimeout(r, 40 + Math.random() * 260));
  }
}

console.log(`Driving ${total} requests at concurrency ${concurrency}…`);
const started = Date.now();
await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));
const elapsed = ((Date.now() - started) / 1000).toFixed(1);

console.log(`\nDone in ${elapsed}s`);
console.log('\nStatus codes:');
for (const [code, count] of Object.entries(stats.byStatus).sort()) {
  console.log(`  ${code}  ${String(count).padStart(4)}`);
}
console.log('\nBy host:');
for (const [host, count] of Object.entries(stats.byHost).sort()) {
  console.log(`  ${host.padEnd(12)} ${String(count).padStart(4)}`);
}
if (stats.errors) console.log(`\nnetwork errors: ${stats.errors}`);
